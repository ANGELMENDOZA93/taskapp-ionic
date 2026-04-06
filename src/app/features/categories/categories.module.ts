import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { CategoriesRoutingModule } from './categories-routing.module';
import { CategoryListPage } from './pages/category-list/category-list.page';
import { CategoryItemComponent } from './components/category-item/category-item.component';
import { CategoryFormModalComponent } from './components/category-form-modal/category-form-modal.component';

@NgModule({
  declarations: [
    CategoryListPage,
    CategoryItemComponent,
    CategoryFormModalComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    CategoriesRoutingModule,
  ],
})
export class CategoriesModule {}
