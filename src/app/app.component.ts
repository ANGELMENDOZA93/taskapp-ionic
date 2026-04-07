import { Component, OnInit, OnDestroy, NgZone, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FeatureFlagService } from './core/services/feature-flag.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styles: [`
    .maintenance-screen {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      text-align: center;
      padding: 24px;
    }
    .maintenance-screen ion-icon {
      font-size: 80px;
      color: var(--ion-color-warning);
      margin-bottom: 24px;
    }
    .maintenance-screen h1 {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 12px;
    }
    .maintenance-screen p {
      color: var(--ion-color-medium);
      font-size: 16px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class AppComponent implements OnInit, OnDestroy {
  maintenanceMode = false;
  private destroy$ = new Subject<void>();
  private onResume = () => {
    console.log('[AppComponent] resume event fired, calling fetchFlags...');
    this.ngZone.run(() => {
      this.featureFlagService.fetchFlags().then((flags) => {
        console.log('[AppComponent] fetchFlags after resume done, enableCategories=' +
          flags.enableCategories + ' welcomeMessage=' + flags.welcomeMessage);
        this.cdr.markForCheck();
      });
    });
  };

  constructor(
    private featureFlagService: FeatureFlagService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
  ) {}

  ngOnInit(): void {
    this.featureFlagService.isEnabled('maintenanceMode')
      .pipe(takeUntil(this.destroy$))
      .subscribe(active => {
        this.maintenanceMode = active;
        this.cdr.markForCheck();
      });

    document.addEventListener('resume', this.onResume, false);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    document.removeEventListener('resume', this.onResume);
  }
}
