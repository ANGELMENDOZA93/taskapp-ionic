import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TaskListPage } from './pages/task-list/task-list.page';
import { TaskDetailPage } from './pages/task-detail/task-detail.page';

const routes: Routes = [
  { path: '', component: TaskListPage },
  { path: 'new', component: TaskDetailPage },
  { path: ':id/edit', component: TaskDetailPage },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TasksRoutingModule {}
