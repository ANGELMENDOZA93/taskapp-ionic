import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Task, TaskFilter } from '@shared/models/task.model';
import { Category } from '@shared/models/category.model';
import { TaskService } from '../../services/task.service';
import { CategoryService } from '@features/categories/services/category.service';
import { FeatureFlagService } from '@core/services/feature-flag.service';

@Component({
  selector: 'app-task-list',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Mis Tareas</ion-title>
        <ion-buttons slot="primary">
          <ion-button (click)="openSearch()">
            <ion-icon slot="icon-only" name="search-outline"></ion-icon>
          </ion-button>
          <ion-button routerLink="/categories" *ngIf="categoriesEnabled">
            <ion-icon slot="icon-only" name="folder-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
      <ion-toolbar *ngIf="showSearch">
        <ion-searchbar
          [(ngModel)]="searchTerm"
          (ionInput)="onSearch($event)"
          (ionClear)="onClearSearch()"
          placeholder="Buscar tareas..."
          animated>
        </ion-searchbar>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-card *ngIf="welcomeMessage && !welcomeDismissed" color="primary" class="ion-margin">
        <ion-card-content>
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
            <p style="margin:0;flex:1;color:white;">{{ welcomeMessage }}</p>
            <ion-button fill="clear" size="small" (click)="dismissWelcome()" style="--color:white;">
              <ion-icon slot="icon-only" name="close-outline"></ion-icon>
            </ion-button>
          </div>
        </ion-card-content>
      </ion-card>
      <app-task-filter
        [filter]="filter"
        [categories]="categoriesEnabled ? categories : []"
        (filterChange)="onFilterChange($event)">
      </app-task-filter>

      <ion-list *ngIf="tasks.length > 0; else emptyState">
        <app-task-item
          *ngFor="let task of tasks; trackBy: trackById"
          [task]="task"
          [category]="getCategoryForTask(task)"
          (toggle)="onToggle($event)"
          (edit)="onEdit($event)"
          (delete)="onDelete($event)">
        </app-task-item>
      </ion-list>

      <ng-template #emptyState>
        <div class="ion-text-center ion-padding" style="margin-top: 30%;">
          <ion-icon name="checkmark-done-outline" style="font-size: 64px; color: var(--ion-color-medium);"></ion-icon>
          <h2>Sin tareas</h2>
          <p>Toca el botón + para crear una nueva tarea</p>
        </div>
      </ng-template>

      <p *ngIf="totalTaskCount >= maxTasksPerUser"
         class="ion-text-center"
         style="color:var(--ion-color-medium);font-size:13px;padding:0 16px 80px;">
        Has alcanzado el límite de {{ maxTasksPerUser }} tareas
      </p>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button [routerLink]="totalTaskCount < maxTasksPerUser ? '/tasks/new' : null"
                        [disabled]="totalTaskCount >= maxTasksPerUser">
          <ion-icon name="add"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class TaskListPage implements OnInit, OnDestroy {

  ionViewWillEnter(): void {
    this.cdr.detectChanges();
  }
  tasks: Task[] = [];
  categories: Category[] = [];
  filter: TaskFilter = { status: 'all' };
  showSearch = false;
  searchTerm = '';
  categoriesEnabled = true;
  welcomeMessage = '';
  welcomeDismissed = false;
  maxTasksPerUser = 100;
  totalTaskCount = 0;
  private categoryMap = new Map<string, Category>();
  private destroy$ = new Subject<void>();

  constructor(
    private taskService: TaskService,
    private categoryService: CategoryService,
    private featureFlagService: FeatureFlagService,
    private toastCtrl: ToastController,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.taskService.getFilteredTasks()
      .pipe(takeUntil(this.destroy$))
      .subscribe(tasks => {
        this.tasks = tasks;
        this.cdr.markForCheck();
      });

    this.categoryService.getCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe(cats => {
        this.categories = cats;
        this.categoryMap.clear();
        cats.forEach(c => this.categoryMap.set(c.id, c));
        this.cdr.markForCheck();
      });

    this.taskService.getFilter()
      .pipe(takeUntil(this.destroy$))
      .subscribe(f => {
        this.filter = f;
        this.cdr.markForCheck();
      });

    this.featureFlagService.isEnabled('enableCategories')
      .pipe(takeUntil(this.destroy$))
      .subscribe(enabled => {
        this.categoriesEnabled = enabled;
        this.cdr.markForCheck();
      });

    this.featureFlagService.getFlag('welcomeMessage')
      .pipe(takeUntil(this.destroy$))
      .subscribe(msg => {
        this.welcomeMessage = msg;
        this.cdr.markForCheck();
      });

    this.featureFlagService.getFlag('maxTasksPerUser')
      .pipe(takeUntil(this.destroy$))
      .subscribe(max => {
        this.maxTasksPerUser = max;
        this.cdr.markForCheck();
      });

    this.taskService.getTasks()
      .pipe(takeUntil(this.destroy$))
      .subscribe(all => {
        this.totalTaskCount = all.length;
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  trackById(_index: number, task: Task): string {
    return task.id;
  }

  getCategoryForTask(task: Task): Category | undefined {
    return task.categoryId ? this.categoryMap.get(task.categoryId) : undefined;
  }

  openSearch(): void {
    this.showSearch = !this.showSearch;
    if (!this.showSearch) {
      this.onClearSearch();
    }
  }

  onSearch(event: CustomEvent): void {
    const term = (event.detail.value || '').trim();
    this.taskService.setFilter({ ...this.filter, searchTerm: term || undefined });
  }

  onClearSearch(): void {
    this.searchTerm = '';
    this.taskService.setFilter({ ...this.filter, searchTerm: undefined });
  }

  onFilterChange(filter: TaskFilter): void {
    this.taskService.setFilter(filter);
  }

  onToggle(id: string): void {
    this.taskService.toggleComplete(id).subscribe();
  }

  onEdit(task: Task): void {
    this.router.navigate(['/tasks', task.id, 'edit']);
  }

  async onDelete(id: string): Promise<void> {
    this.taskService.deleteTask(id).subscribe(async () => {
      const toast = await this.toastCtrl.create({
        message: 'Tarea eliminada',
        duration: 2000,
        color: 'success',
        position: 'bottom',
      });
      await toast.present();
    });
  }

  dismissWelcome(): void {
    this.welcomeDismissed = true;
    this.cdr.markForCheck();
  }
}
