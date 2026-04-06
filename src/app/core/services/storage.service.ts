import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private _storage: Storage | null = null;

  constructor(private storage: Storage) {}

  async init(): Promise<void> {
    if (!this._storage) {
      this._storage = await this.storage.create();
    }
  }

  async get<T>(key: string): Promise<T | null> {
    await this.init();
    return this._storage!.get(key);
  }

  async set<T>(key: string, value: T): Promise<void> {
    await this.init();
    await this._storage!.set(key, value);
  }

  async remove(key: string): Promise<void> {
    await this.init();
    await this._storage!.remove(key);
  }

  async clear(): Promise<void> {
    await this.init();
    await this._storage!.clear();
  }
}
