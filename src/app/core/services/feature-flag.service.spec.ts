import { TestBed } from '@angular/core/testing';
import { FeatureFlagService } from './feature-flag.service';
import { firstValueFrom } from 'rxjs';
import { DEFAULT_FLAGS } from '@shared/models/feature-flags.model';
import { environment } from '@env/environment';

describe('FeatureFlagService', () => {
  let service: FeatureFlagService;
  let originalFirebase: typeof environment.firebase;

  beforeEach(() => {
    originalFirebase = environment.firebase;
    (environment as any).firebase = undefined;

    TestBed.configureTestingModule({
      providers: [FeatureFlagService],
    });

    service = TestBed.inject(FeatureFlagService);
  });

  afterEach(() => {
    (environment as any).firebase = originalFirebase;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should use default flags when Firebase is not configured', async () => {
    await service.initialize();
    const flags = await firstValueFrom(service.getFlags());
    expect(flags).toEqual(DEFAULT_FLAGS);
  });

  it('should return individual flag values', async () => {
    await service.initialize();
    const enableCategories = await firstValueFrom(service.getFlag('enableCategories'));
    expect(enableCategories).toBe(DEFAULT_FLAGS.enableCategories);
  });

  it('should check boolean flags via isEnabled', async () => {
    await service.initialize();
    const enabled = await firstValueFrom(service.isEnabled('enableCategories'));
    expect(enabled).toBeTrue();
  });

  it('should return false for isEnabled on falsy flags', async () => {
    await service.initialize();
    const maintenance = await firstValueFrom(service.isEnabled('maintenanceMode'));
    expect(maintenance).toBeFalse();
  });

  it('should treat non-boolean flags as truthy/falsy in isEnabled', async () => {
    await service.initialize();
    const maxTasks = await firstValueFrom(service.isEnabled('maxTasksPerUser'));
    expect(maxTasks).toBeTrue();
  });
});
