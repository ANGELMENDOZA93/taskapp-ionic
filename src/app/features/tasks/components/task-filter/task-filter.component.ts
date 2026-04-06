import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { TaskFilter } from '@shared/models/task.model';
import { Category } from '@shared/models/category.model';

@Component({
  selector: 'app-task-filter',
  template: `
    <ion-segment [value]="filter.status" (ionChange)="onStatusChange($event)">
      <ion-segment-button value="all">
        <ion-label>Todas</ion-label>
      </ion-segment-button>
      <ion-segment-button value="pending">
        <ion-label>Pendientes</ion-label>
      </ion-segment-button>
      <ion-segment-button value="completed">
        <ion-label>Completadas</ion-label>
      </ion-segment-button>
    </ion-segment>
    <ion-toolbar *ngIf="categories.length > 0">
      <ion-chip *ngFor="let cat of categories; trackBy: trackById"
                [outline]="filter.categoryId !== cat.id"
                [color]="filter.categoryId === cat.id ? 'primary' : 'medium'"
                (click)="onCategoryToggle(cat.id)">
        <ion-icon [name]="cat.icon || 'folder-outline'" [style.color]="filter.categoryId !== cat.id ? cat.color : ''"></ion-icon>
        <ion-label>{{ cat.name }}</ion-label>
      </ion-chip>
    </ion-toolbar>
  `,
  styles: [`
    ion-toolbar {
      --padding-start: 8px;
      --padding-end: 8px;
    }
    ion-chip {
      cursor: pointer;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class TaskFilterComponent {
  @Input() filter: TaskFilter = { status: 'all' };
  @Input() categories: Category[] = [];
  @Output() filterChange = new EventEmitter<TaskFilter>();

  trackById(_index: number, cat: Category): string {
    return cat.id;
  }

  onStatusChange(event: CustomEvent): void {
    this.filterChange.emit({
      ...this.filter,
      status: event.detail.value as TaskFilter['status'],
    });
  }

  onCategoryToggle(categoryId: string): void {
    this.filterChange.emit({
      ...this.filter,
      categoryId: this.filter.categoryId === categoryId ? undefined : categoryId,
    });
  }
}
