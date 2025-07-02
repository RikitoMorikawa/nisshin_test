import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MemberAddComponent } from './member-add/member-add.component';
import { MemberDetailComponent } from './member-detail/member-detail.component';
import { MemberEditComponent } from './member-edit/member-edit.component';
import { MemberListComponent } from './member-list/member-list.component';
import { MemberComponent } from './member.component';
import { BulkAddComponent } from './bulk-add/bulk-add.component';

const routes: Routes = [
  {
    path: '',
    component: MemberComponent,
    children: [
      {
        path: '',
        component: MemberListComponent,
      },
      {
        path: 'detail/:id',
        component: MemberDetailComponent,
      },
      {
        path: 'edit/:id',
        component: MemberEditComponent,
      },
      {
        path: 'add',
        component: MemberAddComponent,
      },
      {
        path: 'bulk-add',
        component: BulkAddComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MemberRoutingModule {}
