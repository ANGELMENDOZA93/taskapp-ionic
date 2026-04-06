import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Category, CATEGORY_COLORS, CATEGORY_ICONS } from '@shared/models/category.model';

@Component({
  selector: 'app-category-form-modal',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ editCategory ? 'Editar Categoría' : 'Nueva Categoría' }}</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">
            <ion-icon name="close-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <ion-item>
          <ion-input formControlName="name"
                     label="Nombre *"
                     labelPlacement="stacked"
                     placeholder="Nombre de la categoría"
                     maxlength="50"></ion-input>
        </ion-item>
        <div class="validation-error" *ngIf="form.get('name')?.touched && form.get('name')?.hasError('required')">
          El nombre es obligatorio
        </div>

        <ion-item-divider>
          <ion-label>Color</ion-label>
        </ion-item-divider>
        <div class="color-grid">
          <div *ngFor="let color of colors; trackBy: trackByColor"
               class="color-swatch"
               [style.background-color]="color"
               [class.selected]="form.get('color')?.value === color"
               (click)="selectColor(color)">
          </div>
        </div>

        <ion-item-divider>
          <ion-label>Icono</ion-label>
        </ion-item-divider>
        <div class="icon-grid">
          <div *ngFor="let icon of icons; trackBy: trackByIcon"
               class="icon-option"
               [class.selected]="form.get('icon')?.value === icon"
               (click)="selectIcon(icon)">
            <ion-icon [name]="icon" size="large"></ion-icon>
          </div>
        </div>

        <ion-button expand="block" type="submit" [disabled]="form.invalid" class="ion-margin-top">
          Guardar
        </ion-button>
      </form>
    </ion-content>
  `,
  styles: [`
    .color-grid {
      display: grid;
      grid-template-columns: repeat(8, 1fr);
      gap: 8px;
      padding: 12px;
    }
    .color-swatch {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      cursor: pointer;
      border: 3px solid transparent;
    }
    .color-swatch.selected {
      border-color: var(--ion-color-dark);
      box-shadow: 0 0 0 2px var(--ion-color-light);
    }
    .icon-grid {
      display: grid;
      grid-template-columns: repeat(8, 1fr);
      gap: 8px;
      padding: 12px;
    }
    .icon-option {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 8px;
      cursor: pointer;
      border: 2px solid transparent;
    }
    .icon-option.selected {
      border-color: var(--ion-color-primary);
      background: var(--ion-color-primary-tint);
    }
    .validation-error {
      color: var(--ion-color-danger);
      font-size: 12px;
      padding: 4px 16px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class CategoryFormModalComponent implements OnInit {
  @Input() editCategory?: Category;

  form!: FormGroup;
  colors = CATEGORY_COLORS;
  icons = CATEGORY_ICONS;

  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: [this.editCategory?.name || '', [Validators.required, Validators.maxLength(50)]],
      color: [this.editCategory?.color || this.colors[0], Validators.required],
      icon: [this.editCategory?.icon || this.icons[0]],
    });
  }

  selectColor(color: string): void {
    this.form.patchValue({ color });
  }

  selectIcon(icon: string): void {
    this.form.patchValue({ icon });
  }

  trackByColor(_index: number, color: string): string {
    return color;
  }

  trackByIcon(_index: number, icon: string): string {
    return icon;
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.modalCtrl.dismiss(this.form.value, 'save');
    }
  }

  dismiss(): void {
    this.modalCtrl.dismiss(null, 'cancel');
  }
}
