import { TestBed } from '@angular/core/testing';
import { TaskService } from './task.service';
import { StorageService } from '@core/services/storage.service';
import { firstValueFrom } from 'rxjs';

describe('TaskService', () => {
  let service: TaskService;
  let storageMock: jasmine.SpyObj<StorageService>;
  let stored: Record<string, unknown>;

  beforeEach(() => {
    stored = {};
    storageMock = jasmine.createSpyObj('StorageService', ['init', 'get', 'set', 'remove', 'clear']);
    storageMock.init.and.returnValue(Promise.resolve());
    storageMock.get.and.callFake((key: string) => Promise.resolve((stored[key] as null) ?? null));
    storageMock.set.and.callFake((key: string, value: unknown) => {
      stored[key] = value;
      return Promise.resolve();
    });

    TestBed.configureTestingModule({
      providers: [
        TaskService,
        { provide: StorageService, useValue: storageMock },
      ],
    });

    service = TestBed.inject(TaskService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with empty tasks when no stored data', async () => {
    await service.init();
    const tasks = await firstValueFrom(service.getTasks());
    expect(tasks).toEqual([]);
  });

  it('should create a task with unique ID and timestamps', async () => {
    await service.init();
    const task = await firstValueFrom(
      service.createTask({ title: 'Test task', completed: false })
    );

    expect(task.id).toBeTruthy();
    expect(task.title).toBe('Test task');
    expect(task.completed).toBeFalse();
    expect(task.createdAt).toBeTruthy();
    expect(task.updatedAt).toBeTruthy();
  });

  it('should delete a task', async () => {
    await service.init();
    const task = await firstValueFrom(
      service.createTask({ title: 'To delete', completed: false })
    );

    await firstValueFrom(service.deleteTask(task.id));

    const tasks = await firstValueFrom(service.getTasks());
    expect(tasks.length).toBe(0);
  });

  it('should toggle task completion', async () => {
    await service.init();
    const task = await firstValueFrom(
      service.createTask({ title: 'Toggle me', completed: false })
    );

    const toggled = await firstValueFrom(service.toggleComplete(task.id));
    expect(toggled.completed).toBeTrue();

    const toggledBack = await firstValueFrom(service.toggleComplete(task.id));
    expect(toggledBack.completed).toBeFalse();
  });

  it('should update a task', async () => {
    await service.init();
    const task = await firstValueFrom(
      service.createTask({ title: 'Original', completed: false })
    );

    const updated = await firstValueFrom(
      service.updateTask(task.id, { title: 'Updated' })
    );

    expect(updated.title).toBe('Updated');
    expect(updated.id).toBe(task.id);
  });

  it('should filter tasks by pending status', async () => {
    await service.init();
    await firstValueFrom(service.createTask({ title: 'Pending', completed: false }));
    await firstValueFrom(service.createTask({ title: 'Done', completed: true }));

    service.setFilter({ status: 'pending' });
    const filtered = await firstValueFrom(service.getFilteredTasks());
    expect(filtered.length).toBe(1);
    expect(filtered[0].title).toBe('Pending');
  });

  it('should filter tasks by completed status', async () => {
    await service.init();
    await firstValueFrom(service.createTask({ title: 'Pending', completed: false }));
    await firstValueFrom(service.createTask({ title: 'Done', completed: true }));

    service.setFilter({ status: 'completed' });
    const filtered = await firstValueFrom(service.getFilteredTasks());
    expect(filtered.length).toBe(1);
    expect(filtered[0].title).toBe('Done');
  });

  it('should filter tasks by category', async () => {
    await service.init();
    await firstValueFrom(service.createTask({ title: 'Cat A', completed: false, categoryId: 'cat-1' }));
    await firstValueFrom(service.createTask({ title: 'Cat B', completed: false, categoryId: 'cat-2' }));

    service.setFilter({ status: 'all', categoryId: 'cat-1' });
    const filtered = await firstValueFrom(service.getFilteredTasks());
    expect(filtered.length).toBe(1);
    expect(filtered[0].title).toBe('Cat A');
  });

  it('should filter tasks by search term', async () => {
    await service.init();
    await firstValueFrom(service.createTask({ title: 'Buy milk', completed: false }));
    await firstValueFrom(service.createTask({ title: 'Fix car', completed: false }));

    service.setFilter({ status: 'all', searchTerm: 'milk' });
    const filtered = await firstValueFrom(service.getFilteredTasks());
    expect(filtered.length).toBe(1);
    expect(filtered[0].title).toBe('Buy milk');
  });

  it('should clear category from tasks when category is deleted', async () => {
    await service.init();
    await firstValueFrom(service.createTask({ title: 'Categorized', completed: false, categoryId: 'cat-x' }));

    await firstValueFrom(service.clearCategoryFromTasks('cat-x'));

    const tasks = await firstValueFrom(service.getTasks());
    expect(tasks[0].categoryId).toBeUndefined();
  });

  it('should count tasks by category', async () => {
    await service.init();
    await firstValueFrom(service.createTask({ title: 'A', completed: false, categoryId: 'cat-1' }));
    await firstValueFrom(service.createTask({ title: 'B', completed: false, categoryId: 'cat-1' }));
    await firstValueFrom(service.createTask({ title: 'C', completed: false, categoryId: 'cat-2' }));

    expect(service.getTaskCountByCategory('cat-1')).toBe(2);
    expect(service.getTaskCountByCategory('cat-2')).toBe(1);
  });
});
