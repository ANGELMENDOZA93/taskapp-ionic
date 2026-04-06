import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';
import { Category, DEFAULT_CATEGORIES } from '@shared/models/category.model';
import { StorageService } from '@core/services/storage.service';

const STORAGE_KEY = 'categories';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private categories$ = new BehaviorSubject<Category[]>([]);

  constructor(private storageService: StorageService) {}

  async init(): Promise<void> {
    const stored = await this.storageService.get<Category[]>(STORAGE_KEY);
    if (stored && stored.length > 0) {
      this.categories$.next(stored);
    } else {
      await this.initDefaultCategories();
    }
  }

  getCategories(): Observable<Category[]> {
    return this.categories$.asObservable();
  }

  getCategoryById(id: string): Observable<Category | undefined> {
    return this.categories$.pipe(
      map(cats => cats.find(c => c.id === id))
    );
  }

  createCategory(data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Observable<Category> {
    const now = new Date().toISOString();
    const category: Category = {
      ...data,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    };

    const current = this.categories$.getValue();
    const updated = [...current, category];
    return from(this.persist(updated)).pipe(map(() => category));
  }

  updateCategory(id: string, data: Partial<Category>): Observable<Category> {
    const current = this.categories$.getValue();
    const index = current.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error(`Category with id ${id} not found`);
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

  deleteCategory(id: string): Observable<void> {
    const current = this.categories$.getValue();
    const updated = current.filter(c => c.id !== id);
    return from(this.persist(updated)).pipe(map(() => void 0));
  }

  isNameUnique(name: string, excludeId?: string): boolean {
    const current = this.categories$.getValue();
    return !current.some(c => c.name.toLowerCase() === name.toLowerCase() && c.id !== excludeId);
  }

  private async initDefaultCategories(): Promise<void> {
    const now = new Date().toISOString();
    const defaults: Category[] = DEFAULT_CATEGORIES.map(cat => ({
      ...cat,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    }));
    await this.persist(defaults);
  }

  private async persist(categories: Category[]): Promise<void> {
    this.categories$.next(categories);
    await this.storageService.set(STORAGE_KEY, categories);
  }
}
