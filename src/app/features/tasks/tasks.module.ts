import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { TasksRoutingModule } from './tasks-routing.module';
import { TaskListPage } from './pages/task-list/task-list.page';
import { TaskDetailPage } from './pages/task-detail/task-detail.page';
import { TaskItemComponent } from './components/task-item/task-item.component';
import { TaskFilterComponent } from './components/task-filter/task-filter.component';

@NgModule({
  declarations: [
    TaskListPage,
    TaskDetailPage,
    TaskItemComponent,
    TaskFilterComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    TasksRoutingModule,
  ],
})
export class TasksModule {}
