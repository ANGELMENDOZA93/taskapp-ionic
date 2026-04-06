import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';
import { Task, TaskFilter } from '@shared/models/task.model';
import { StorageService } from '@core/services/storage.service';

const STORAGE_KEY = 'tasks';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private tasks$ = new BehaviorSubject<Task[]>([]);
  private filter$ = new BehaviorSubject<TaskFilter>({ status: 'all' });

  constructor(private storageService: StorageService) {}

  async init(): Promise<void> {
    const stored = await this.storageService.get<Task[]>(STORAGE_KEY);
    if (stored) {
      this.tasks$.next(stored);
    }
  }

  getTasks(): Observable<Task[]> {
    return this.tasks$.asObservable();
  }

  getFilteredTasks(): Observable<Task[]> {
    return combineLatest([this.tasks$, this.filter$]).pipe(
      map(([tasks, filter]) => this.applyFilter(tasks, filter))
    );
  }

  getTaskById(id: string): Observable<Task | undefined> {
    return this.tasks$.pipe(map(tasks => tasks.find(t => t.id === id)));
  }

  setFilter(filter: TaskFilter): void {
    this.filter$.next(filter);
  }

  getFilter(): Observable<TaskFilter> {
    return this.filter$.asObservable();
  }

  createTask(data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Observable<Task> {
    const now = new Date().toISOString();
    const task: Task = {
      ...data,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    };

    const current = this.tasks$.getValue();
    const updated = [task, ...current];
    return from(this.persist(updated)).pipe(map(() => task));
  }

  updateTask(id: string, data: Partial<Task>): Observable<Task> {
    const current = this.tasks$.getValue();
    const index = current.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error(`Task with id ${id} not found`);
    }

    const updated = [...current];
    updated[index] = {
      ...updated[index],
      ...data,
      id: updated[index].id,
      createdAt: updated[index].createdAt,
      updatedAt: new Date().toISOString(),
    };

    return from(this.persist(updated)).pipe(map(() => updated[index]));
  }

  deleteTask(id: string): Observable<void> {
    const current = this.tasks$.getValue();
    const updated = current.filter(t => t.id !== id);
    return from(this.persist(updated)).pipe(map(() => void 0));
  }

  toggleComplete(id: string): Observable<Task> {
    const current = this.tasks$.getValue();
    const task = current.find(t => t.id === id);
    if (!task) {
      throw new Error(`Task with id ${id} not found`);
    }
    return this.updateTask(id, { completed: !task.completed });
  }

  getTaskCountByCategory(categoryId: string): number {
    return this.tasks$.getValue().filter(t => t.categoryId === categoryId).length;
  }

  clearCategoryFromTasks(categoryId: string): Observable<void> {
    const current = this.tasks$.getValue();
    const updated = current.map(t =>
      t.categoryId === categoryId
        ? { ...t, categoryId: undefined, updatedAt: new Date().toISOString() }
        : t
    );
    return from(this.persist(updated)).pipe(map(() => void 0));
  }

  private applyFilter(tasks: Task[], filter: TaskFilter): Task[] {
    let filtered = [...tasks];

    if (filter.status === 'pending') {
      filtered = filtered.filter(t => !t.completed);
    } else if (filter.status === 'completed') {
      filtered = filtered.filter(t => t.completed);
    }

    if (filter.categoryId) {
      filtered = filtered.filter(t => t.categoryId === filter.categoryId);
    }

    if (filter.searchTerm) {
      const term = filter.searchTerm.toLowerCase();
      filtered = filtered.filter(t => t.title.toLowerCase().includes(term));
    }

    // Sort: pending first, then by creation date desc
    filtered.sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return filtered;
  }

  private async persist(tasks: Task[]): Promise<void> {
    this.tasks$.next(tasks);
    await this.storageService.set(STORAGE_KEY, tasks);
  }
}
