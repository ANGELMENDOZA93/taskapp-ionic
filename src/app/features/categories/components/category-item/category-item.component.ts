import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { Category } from '@shared/models/category.model';

@Component({
  selector: 'app-category-item',
  template: `
    <ion-item-sliding>
      <ion-item (click)="edit.emit(category)" button detail>
        <ion-icon [name]="category.icon || 'folder-outline'"
                  [style.color]="category.color"
                  slot="start"></ion-icon>
        <ion-label>{{ category.name }}</ion-label>
        <ion-badge slot="end" color="medium">{{ taskCount }}</ion-badge>
      </ion-item>
      <ion-item-options side="end">
        <ion-item-option color="danger" (click)="delete.emit(category.id)">
          <ion-icon slot="icon-only" name="trash-outline"></ion-icon>
        </ion-item-option>
      </ion-item-options>
    </ion-item-sliding>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class CategoryItemComponent {
  @Input() category!: Category;
  @Input() taskCount = 0;
  @Output() edit = new EventEmitter<Category>();
  @Output() delete = new EventEmitter<string>();
}
