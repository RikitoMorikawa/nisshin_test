import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { Gift2Component } from './gift2.component';
import { Gift2AddComponent } from './gift2-add/gift2-add.component';
import { Gift2DetailComponent } from './gift2-detail/gift2-detail.component';
import { Gift2EditComponent } from './gift2-edit/gift2-edit.component';
import { Gift2ListComponent } from './gift2-list/gift2-list.component';

import { ToggleButtonModule } from '../toggle-button/toggle-button.module';
import { TableOrgModule } from 'src/app/components/organisms/gift2-org/table-org/table-org.module';
import { SearchOrgModule } from 'src/app/components/organisms/gift2-org/search-org/search-org.module';

import { BreadcrumbOrgModule } from 'src/app/components/organisms/breadcrumb-org/breadcrumb-org.module';
import { NewRegistrationLinkOrgModule } from 'src/app/components/organisms/new-registration-link-org/new-registration-link-org.module';
import { LoadingContainerModule } from 'src/app/components/molecules/loading-container/loading-container.module';
import { BackToLinkOrgModule } from 'src/app/components/organisms/back-to-link-org/back-to-link-org.module';
import { EditLinkOrgModule } from 'src/app/components/organisms/edit-link-org/edit-link-org.module';
import { DeleteLinkOrgModule } from 'src/app/components/organisms/delete-link-org/delete-link-org.module';
import { LastUpdaterOrgModule } from 'src/app/components/organisms/last-updater-org/last-updater-org.module';
import { CancelLinkOrgModule } from 'src/app/components/organisms/cancel-link-org/cancel-link-org.module';
import { TextContainerModule } from 'src/app/components/molecules/text-container/text-container.module';
import { ButtonModule } from 'src/app/components/atoms/button/button.module';
import { CommonService } from 'src/app/services/shared/common.service';

@NgModule({
  declarations: [
    Gift2Component,
    Gift2AddComponent,
    Gift2DetailComponent,
    Gift2EditComponent,
    Gift2ListComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    ToggleButtonModule,
    TableOrgModule,
    SearchOrgModule,
    BreadcrumbOrgModule,
    NewRegistrationLinkOrgModule,
    LoadingContainerModule,
    BackToLinkOrgModule,
    EditLinkOrgModule,
    DeleteLinkOrgModule,
    LastUpdaterOrgModule,
    CancelLinkOrgModule,
    ReactiveFormsModule,
    TextContainerModule,
    ButtonModule,
  ],
  providers: [CommonService],
})
export class Gift2Module {}
