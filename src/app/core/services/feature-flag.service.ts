import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FeatureFlags, DEFAULT_FLAGS } from '@shared/models/feature-flags.model';
import { environment } from '@env/environment';

import { initializeApp, deleteApp, FirebaseApp } from 'firebase/app';
import { getRemoteConfig, fetchConfig, activate, getValue } from 'firebase/remote-config';

@Injectable({ providedIn: 'root' })
export class FeatureFlagService {
  private flags$ = new BehaviorSubject<FeatureFlags>(DEFAULT_FLAGS);
  private fetchCounter = 0;

  async initialize(): Promise<void> {
    try {
      if (!environment.firebase?.projectId) {
        console.warn('Firebase not configured, using default flags');
        return;
      }
      await this.fetchFlags();
    } catch (error) {
      console.error('[FeatureFlags] Initialization failed, using defaults:', error);
    }
  }

  async fetchFlags(): Promise<FeatureFlags> {
    if (!environment.firebase?.projectId) {
      return DEFAULT_FLAGS;
    }

    let app: FirebaseApp | null = null;
    try {
      const appName = 'rc-fetch-' + (++this.fetchCounter);
      app = initializeApp(environment.firebase, appName);
      const rc = getRemoteConfig(app);
      rc.settings.minimumFetchIntervalMillis = 0;
      rc.defaultConfig = { ...DEFAULT_FLAGS } as Record<string, string | number | boolean>;

      const t0 = Date.now();
      await fetchConfig(rc);
      await activate(rc);
      console.log('[FeatureFlags] fetch took ' + (Date.now() - t0) + 'ms, status=' + rc.lastFetchStatus);

      const flags: FeatureFlags = {
        enableCategories: getValue(rc, 'enableCategories').asBoolean(),
        enableDarkMode: getValue(rc, 'enableDarkMode').asBoolean(),
        enableExport: getValue(rc, 'enableExport').asBoolean(),
        maxTasksPerUser: getValue(rc, 'maxTasksPerUser').asNumber(),
        maintenanceMode: getValue(rc, 'maintenanceMode').asBoolean(),
        welcomeMessage: getValue(rc, 'welcomeMessage').asString(),
      };

      console.log('[FeatureFlags] values: enableCategories=' + flags.enableCategories +
        ' welcomeMessage=' + flags.welcomeMessage);

      this.flags$.next(flags);

      deleteApp(app).catch(() => {});

      return flags;
    } catch (error) {
      console.error('[FeatureFlags] fetch failed:', error);
      if (app) { deleteApp(app).catch(() => {}); }
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
