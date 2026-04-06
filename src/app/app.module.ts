import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { IonicStorageModule } from '@ionic/storage-angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { StorageService } from './core/services/storage.service';
import { CategoryService } from './features/categories/services/category.service';
import { TaskService } from './features/tasks/services/task.service';
import { FeatureFlagService } from './core/services/feature-flag.service';

function initializeApp(
  storageService: StorageService,
  categoryService: CategoryService,
  taskService: TaskService,
  featureFlagService: FeatureFlagService,
): () => Promise<void> {
  return async () => {
    await storageService.init();
    await categoryService.init();
    await taskService.init();
    await featureFlagService.initialize();
  };
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    IonicStorageModule.forRoot(),
    AppRoutingModule,
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [StorageService, CategoryService, TaskService, FeatureFlagService],
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
