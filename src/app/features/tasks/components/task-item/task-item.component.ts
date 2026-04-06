import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { Task } from '@shared/models/task.model';
import { Category } from '@shared/models/category.model';

@Component({
  selector: 'app-task-item',
  template: `
    <ion-item-sliding>
      <ion-item (click)="edit.emit(task)" button>
        <ion-checkbox slot="start"
                      [checked]="task.completed"
                      (ionChange)="onToggle($event)">
        </ion-checkbox>
        <ion-label [class.completed]="task.completed">
          <h2>{{ task.title }}</h2>
          <p *ngIf="category">
            <ion-icon [name]="category.icon || 'folder-outline'"
                      [style.color]="category.color"
                      style="vertical-align: middle;"></ion-icon>
            {{ category.name }}
            &middot;
            {{ task.createdAt | date:'shortDate' }}
          </p>
          <p *ngIf="!category">
            {{ task.createdAt | date:'shortDate' }}
          </p>
        </ion-label>
      </ion-item>
      <ion-item-options side="end">
        <ion-item-option color="danger" (click)="delete.emit(task.id)">
          <ion-icon slot="icon-only" name="trash-outline"></ion-icon>
        </ion-item-option>
      </ion-item-options>
    </ion-item-sliding>
  `,
  styles: [`
    .completed h2 {
      text-decoration: line-through;
      color: var(--ion-color-medium);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class TaskItemComponent {
  @Input() task!: Task;
  @Input() category?: Category;
  @Output() toggle = new EventEmitter<string>();
  @Output() edit = new EventEmitter<Task>();
  @Output() delete = new EventEmitter<string>();

  onToggle(event: CustomEvent): void {
    event.stopPropagation();
    this.toggle.emit(this.task.id);
  }
}
