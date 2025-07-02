import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomTagAddEditComponent } from './custom-tag-add-edit/custom-tag-add-edit.component';
import { CustomTagBulkAddComponent } from './custom-tag-bulk-add/custom-tag-bulk-add.component';
import { CustomTagDetailComponent } from './custom-tag-detail/custom-tag-detail.component';
import { CustomTagListComponent } from './custom-tag-list/custom-tag-list.component';
import { CustomTagComponent } from './custom-tag.component';

const routes: Routes = [
  {
    path: '',
    component: CustomTagComponent,
    children: [
      { path: '', component: CustomTagListComponent },
      { path: 'detail/:id', component: CustomTagDetailComponent },
      { path: 'edit/:id', component: CustomTagAddEditComponent },
      { path: 'add', component: CustomTagAddEditComponent },
      { path: 'bulk-add', component: CustomTagBulkAddComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CustomTagRoutingModule {}
