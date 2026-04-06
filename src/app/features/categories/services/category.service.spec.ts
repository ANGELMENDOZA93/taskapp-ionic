import { TestBed } from '@angular/core/testing';
import { CategoryService } from './category.service';
import { StorageService } from '@core/services/storage.service';
import { firstValueFrom } from 'rxjs';

describe('CategoryService', () => {
  let service: CategoryService;
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
        CategoryService,
        { provide: StorageService, useValue: storageMock },
      ],
    });

    service = TestBed.inject(CategoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with default categories when storage is empty', async () => {
    await service.init();
    const categories = await firstValueFrom(service.getCategories());
    expect(categories.length).toBe(3);
    expect(categories.map(c => c.name)).toContain('Personal');
    expect(categories.map(c => c.name)).toContain('Trabajo');
    expect(categories.map(c => c.name)).toContain('Salud');
  });

  it('should create a new category', async () => {
    await service.init();
    const created = await firstValueFrom(
      service.createCategory({ name: 'Compras', color: '#FF9800', icon: 'cart-outline' })
    );

    expect(created.id).toBeTruthy();
    expect(created.name).toBe('Compras');
    expect(created.color).toBe('#FF9800');

    const all = await firstValueFrom(service.getCategories());
    expect(all.length).toBe(4);
  });

  it('should update a category', async () => {
    await service.init();
    const categories = await firstValueFrom(service.getCategories());
    const first = categories[0];

    const updated = await firstValueFrom(
      service.updateCategory(first.id, { name: 'Updated Name' })
    );

    expect(updated.name).toBe('Updated Name');
    expect(updated.id).toBe(first.id);
  });

  it('should delete a category', async () => {
    await service.init();
    const categories = await firstValueFrom(service.getCategories());
    const first = categories[0];

    await firstValueFrom(service.deleteCategory(first.id));

    const remaining = await firstValueFrom(service.getCategories());
    expect(remaining.length).toBe(2);
    expect(remaining.find(c => c.id === first.id)).toBeUndefined();
  });

  it('should validate unique names (case insensitive)', async () => {
    await service.init();
    expect(service.isNameUnique('Personal')).toBeFalse();
    expect(service.isNameUnique('personal')).toBeFalse();
    expect(service.isNameUnique('PERSONAL')).toBeFalse();
    expect(service.isNameUnique('Unique Name')).toBeTrue();
  });

  it('should allow same name when excluding current category id', async () => {
    await service.init();
    const categories = await firstValueFrom(service.getCategories());
    const personal = categories.find(c => c.name === 'Personal')!;

    expect(service.isNameUnique('Personal', personal.id)).toBeTrue();
  });

  it('should get category by id', async () => {
    await service.init();
    const categories = await firstValueFrom(service.getCategories());
    const first = categories[0];

    const found = await firstValueFrom(service.getCategoryById(first.id));
    expect(found).toBeTruthy();
    expect(found!.name).toBe(first.name);
  });

  it('should return undefined for non-existent category id', async () => {
    await service.init();
    const found = await firstValueFrom(service.getCategoryById('nonexistent'));
    expect(found).toBeUndefined();
  });
});
