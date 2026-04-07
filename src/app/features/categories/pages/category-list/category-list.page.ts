import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ModalController, AlertController, ToastController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Category } from '@shared/models/category.model';
import { CategoryService } from '../../services/category.service';
import { TaskService } from '@features/tasks/services/task.service';
import { CategoryFormModalComponent } from '../../components/category-form-modal/category-form-modal.component';

@Component({
  selector: 'app-category-list',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/tasks"></ion-back-button>
        </ion-buttons>
        <ion-title>Categorías</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="openCreateModal()">
            <ion-icon slot="icon-only" name="add-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-list *ngIf="categories.length > 0; else emptyState">
        <app-category-item
          *ngFor="let cat of categories; trackBy: trackById"
          [category]="cat"
          [taskCount]="0"
          (edit)="openEditModal($event)"
          (delete)="confirmDelete($event)">
        </app-category-item>
      </ion-list>
      <ng-template #emptyState>
        <div class="ion-text-center ion-padding" style="margin-top: 40%;">
          <ion-icon name="folder-open-outline" style="font-size: 64px; color: var(--ion-color-medium);"></ion-icon>
          <p>No hay categorías</p>
        </div>
      </ng-template>
    </ion-content>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class CategoryListPage implements OnInit, OnDestroy {
  categories: Category[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private categoryService: CategoryService,
    private taskService: TaskService,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.categoryService.getCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe(cats => {
        this.categories = cats;
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  trackById(_index: number, cat: Category): string {
    return cat.id;
  }

  async openCreateModal(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: CategoryFormModalComponent,
    });
    await modal.present();

    const { data, role } = await modal.onWillDismiss();
    if (role === 'save' && data) {
      if (!this.categoryService.isNameUnique(data.name)) {
        await this.showToast('Ya existe una categoría con ese nombre', 'warning');
        return;
      }
      this.categoryService.createCategory(data).subscribe(() => {
        this.showToast('Categoría creada');
      });
    }
  }

  async openEditModal(category: Category): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: CategoryFormModalComponent,
      componentProps: { editCategory: category },
    });
    await modal.present();

    const { data, role } = await modal.onWillDismiss();
    if (role === 'save' && data) {
      if (!this.categoryService.isNameUnique(data.name, category.id)) {
        await this.showToast('Ya existe una categoría con ese nombre', 'warning');
        return;
      }
      this.categoryService.updateCategory(category.id, data).subscribe(() => {
        this.showToast('Categoría actualizada');
      });
    }
  }

  async confirmDelete(id: string): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar categoría',
      message: '¿Estás seguro? Las tareas asociadas perderán su categoría.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.taskService.clearCategoryFromTasks(id).subscribe(() => {
              this.categoryService.deleteCategory(id).subscribe(() => {
                this.showToast('Categoría eliminada');
              });
            });
          },
        },
      ],
    });
    await alert.present();
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
