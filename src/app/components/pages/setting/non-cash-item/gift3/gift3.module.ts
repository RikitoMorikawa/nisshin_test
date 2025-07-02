import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { Gift3Component } from './gift3.component';
import { Gift3ListComponent } from './gift3-list/gift3-list.component';
import { Gift3AddComponent } from './gift3-add/gift3-add.component';
import { Gift3DetailComponent } from './gift3-detail/gift3-detail.component';
import { Gift3EditComponent } from './gift3-edit/gift3-edit.component';

import { TableOrgModule } from 'src/app/components/organisms/gift3-org/table-org/table-org.module';
import { SearchOrgModule } from 'src/app/components/organisms/gift3-org/search-org/search-org.module';
import { ToggleButtonModule } from '../toggle-button/toggle-button.module';

import { BreadcrumbOrgModule } from 'src/app/components/organisms/breadcrumb-org/breadcrumb-org.module';
import { NewRegistrationLinkOrgModule } from 'src/app/components/organisms/new-registration-link-org/new-registration-link-org.module';
import { LoadingContainerModule } from 'src/app/components/molecules/loading-container/loading-container.module';
import { CancelLinkOrgModule } from 'src/app/components/organisms/cancel-link-org/cancel-link-org.module';
import { LastUpdaterOrgModule } from 'src/app/components/organisms/last-updater-org/last-updater-org.module';
import { TextContainerModule } from 'src/app/components/molecules/text-container/text-container.module';
import { ButtonModule } from 'src/app/components/atoms/button/button.module';
import { BackToLinkOrgModule } from 'src/app/components/organisms/back-to-link-org/back-to-link-org.module';
import { DeleteLinkOrgModule } from 'src/app/components/organisms/delete-link-org/delete-link-org.module';
import { EditLinkOrgModule } from 'src/app/components/organisms/edit-link-org/edit-link-org.module';
import { CommonService } from 'src/app/services/shared/common.service';

@NgModule({
  declarations: [
    Gift3Component,
    Gift3ListComponent,
    Gift3AddComponent,
    Gift3DetailComponent,
    Gift3EditComponent,
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
    CancelLinkOrgModule,
    LastUpdaterOrgModule,
    TextContainerModule,
    ReactiveFormsModule,
    ButtonModule,
    BackToLinkOrgModule,
    DeleteLinkOrgModule,
    EditLinkOrgModule,
  ],
  providers: [CommonService],
})
export class Gift3Module {}
