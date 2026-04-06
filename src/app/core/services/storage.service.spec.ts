import { TestBed } from '@angular/core/testing';
import { StorageService } from './storage.service';
import { Storage } from '@ionic/storage-angular';

describe('StorageService', () => {
  let service: StorageService;
  let storageSpy: jasmine.SpyObj<Storage>;
  let mockStorage: Record<string, unknown>;

  beforeEach(() => {
    mockStorage = {};
    storageSpy = jasmine.createSpyObj('Storage', ['create', 'get', 'set', 'remove', 'clear']);

    storageSpy.create.and.returnValue(Promise.resolve({
      get: (key: string) => Promise.resolve(mockStorage[key] ?? null),
      set: (key: string, value: unknown) => { mockStorage[key] = value; return Promise.resolve(); },
      remove: (key: string) => { delete mockStorage[key]; return Promise.resolve(); },
      clear: () => { mockStorage = {}; return Promise.resolve(); },
    } as unknown as Storage));

    TestBed.configureTestingModule({
      providers: [
        StorageService,
        { provide: Storage, useValue: storageSpy },
      ],
    });

    service = TestBed.inject(StorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should init storage on first get', async () => {
    await service.get('test');
    expect(storageSpy.create).toHaveBeenCalled();
  });

  it('should save and retrieve a value', async () => {
    await service.set('key1', { name: 'test' });
    const result = await service.get<{ name: string }>('key1');
    expect(result).toEqual({ name: 'test' });
  });

  it('should return null for non-existent key', async () => {
    const result = await service.get('nonexistent');
    expect(result).toBeNull();
  });

  it('should remove a value', async () => {
    await service.set('key1', 'value');
    await service.remove('key1');
    const result = await service.get('key1');
    expect(result).toBeNull();
  });

  it('should clear all values', async () => {
    await service.set('a', 1);
    await service.set('b', 2);
    await service.clear();
    const a = await service.get('a');
    const b = await service.get('b');
    expect(a).toBeNull();
    expect(b).toBeNull();
  });
});
