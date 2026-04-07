import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';
import { Category } from '@shared/models/category.model';
import { Task } from '@shared/models/task.model';
import { TaskService } from '../../services/task.service';
import { CategoryService } from '@features/categories/services/category.service';
import { FeatureFlagService } from '@core/services/feature-flag.service';

@Component({
  selector: 'app-task-detail',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/tasks"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ isEditing ? 'Editar Tarea' : 'Nueva Tarea' }}</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="onSave()" [disabled]="form.invalid">
            Guardar
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <form [formGroup]="form">
        <ion-item>
          <ion-input formControlName="title"
                     label="Título *"
                     labelPlacement="stacked"
                     placeholder="¿Qué necesitas hacer?"
                     maxlength="200"></ion-input>
        </ion-item>
        <div class="validation-error" *ngIf="form.get('title')?.touched && form.get('title')?.hasError('required')">
          El título es obligatorio
        </div>

        <ion-item>
          <ion-textarea formControlName="description"
                        label="Descripción"
                        labelPlacement="stacked"
                        placeholder="Detalles adicionales (opcional)"
                        maxlength="1000"
                        rows="4"
                        autoGrow>
          </ion-textarea>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Fecha límite</ion-label>
          <ion-input type="date" formControlName="dueDate"></ion-input>
        </ion-item>

        <ion-item *ngIf="categoriesEnabled && categoriesLoaded">
          <ion-select formControlName="categoryId"
                      label="Categoría"
                      labelPlacement="stacked"
                      placeholder="Seleccionar categoría"
                      interface="alert">
            <ion-select-option [value]="null">Sin categoría</ion-select-option>
            <ion-select-option *ngFor="let cat of categories; trackBy: trackById"
                               [value]="cat.id">
              {{ cat.name }}
            </ion-select-option>
          </ion-select>
        </ion-item>
      </form>
    </ion-content>
  `,
  styles: [`
    .validation-error {
      color: var(--ion-color-danger);
      font-size: 12px;
      padding: 4px 16px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class TaskDetailPage implements OnInit, OnDestroy {
  form!: FormGroup;
  categories: Category[] = [];
  categoriesEnabled = true;
  categoriesLoaded = false;
  isEditing = false;
  private taskId?: string;
  private currentTaskCount = 0;
  private maxTasksPerUser = 100;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private taskService: TaskService,
    private categoryService: CategoryService,
    private featureFlagService: FeatureFlagService,
    private toastCtrl: ToastController,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(200)]],
      description: ['', Validators.maxLength(1000)],
      categoryId: [null],
      dueDate: [null],
    });

    this.featureFlagService.isEnabled('enableCategories')
      .pipe(takeUntil(this.destroy$))
      .subscribe(enabled => {
        this.categoriesEnabled = enabled;
        this.cdr.markForCheck();
      });

    this.categoryService.getCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe(cats => {
        this.categories = cats;
        this.categoriesLoaded = true;
        this.cdr.detectChanges();
      });

    this.featureFlagService.getFlag('maxTasksPerUser')
      .pipe(takeUntil(this.destroy$))
      .subscribe(max => { this.maxTasksPerUser = max; });

    this.taskService.getTasks()
      .pipe(takeUntil(this.destroy$))
      .subscribe(tasks => { this.currentTaskCount = tasks.length; });

    this.taskId = this.route.snapshot.paramMap.get('id') || undefined;
    if (this.taskId) {
      this.isEditing = true;
      this.taskService.getTaskById(this.taskId)
        .pipe(takeUntil(this.destroy$))
        .subscribe(task => {
          if (task) {
            this.form.patchValue({
              title: task.title,
              description: task.description || '',
              categoryId: task.categoryId || null,
              dueDate: task.dueDate || null,
            });
            this.cdr.markForCheck();
          }
        });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  trackById(_index: number, cat: Category): string {
    return cat.id;
  }

  async onSave(): Promise<void> {
    if (this.form.invalid) return;
    if (!this.isEditing && this.currentTaskCount >= this.maxTasksPerUser) {
      await this.showToast(`Límite de ${this.maxTasksPerUser} tareas alcanzado`, 'warning');
      return;
    }

    const formValue = this.form.value;
    const data = {
      title: formValue.title.trim(),
      description: formValue.description?.trim() || undefined,
      categoryId: formValue.categoryId || undefined,
      dueDate: formValue.dueDate || undefined,
    };

    if (this.isEditing && this.taskId) {
      this.taskService.updateTask(this.taskId, data).subscribe(async () => {
        await this.showToast('Tarea actualizada');
        this.router.navigate(['/tasks']);
      });
    } else {
      this.taskService.createTask({ ...data, completed: false }).subscribe(async () => {
        await this.showToast('Tarea creada');
        this.router.navigate(['/tasks']);
      });
    }
  }

  private async showToast(message: string, color = 'success'): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color,
      position: 'bottom',
    });
    await toast.present();
  }
}
