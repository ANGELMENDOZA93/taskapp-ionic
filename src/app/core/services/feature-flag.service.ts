import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FeatureFlags, DEFAULT_FLAGS } from '@shared/models/feature-flags.model';
import { environment } from '@env/environment';

import { initializeApp, FirebaseApp } from 'firebase/app';
import { getRemoteConfig, RemoteConfig, fetchAndActivate, getValue } from 'firebase/remote-config';

@Injectable({ providedIn: 'root' })
export class FeatureFlagService {
  private flags$ = new BehaviorSubject<FeatureFlags>(DEFAULT_FLAGS);
  private remoteConfig: RemoteConfig | null = null;

  async initialize(): Promise<void> {
    try {
      if (!environment.firebase?.projectId) {
        console.warn('Firebase not configured, using default flags');
        return;
      }

      const app: FirebaseApp = initializeApp(environment.firebase);
      this.remoteConfig = getRemoteConfig(app);
      this.remoteConfig.settings.minimumFetchIntervalMillis =
        environment.production ? 3600000 : 0;

      this.remoteConfig.defaultConfig = { ...DEFAULT_FLAGS } as Record<string, string | number | boolean>;

      await this.fetchFlags();
    } catch (error) {
      console.warn('Firebase Remote Config initialization failed, using defaults', error);
    }
  }

  async fetchFlags(): Promise<FeatureFlags> {
    if (!this.remoteConfig) {
      return DEFAULT_FLAGS;
    }

    try {
      await fetchAndActivate(this.remoteConfig);

      const flags: FeatureFlags = {
        enableCategories: getValue(this.remoteConfig, 'enableCategories').asBoolean(),
        enableDarkMode: getValue(this.remoteConfig, 'enableDarkMode').asBoolean(),
        enableExport: getValue(this.remoteConfig, 'enableExport').asBoolean(),
        maxTasksPerUser: getValue(this.remoteConfig, 'maxTasksPerUser').asNumber(),
        maintenanceMode: getValue(this.remoteConfig, 'maintenanceMode').asBoolean(),
        welcomeMessage: getValue(this.remoteConfig, 'welcomeMessage').asString(),
      };

      this.flags$.next(flags);
      return flags;
    } catch (error) {
      console.warn('Failed to fetch remote config', error);
      return this.flags$.getValue();
    }
  }

  getFlags(): Observable<FeatureFlags> {
    return this.flags$.asObservable();
  }

  getFlag<K extends keyof FeatureFlags>(key: K): Observable<FeatureFlags[K]> {
    return this.flags$.pipe(map(flags => flags[key]));
  }

  isEnabled(feature: keyof FeatureFlags): Observable<boolean> {
    return this.flags$.pipe(map(flags => {
      const val = flags[feature];
      return typeof val === 'boolean' ? val : !!val;
    }));
  }
}
