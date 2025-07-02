import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { QualityCustomerRoutingModule } from './quality-customer-routing.module';
import { QualityCustomerComponent } from './quality-customer.component';
import { ListComponent } from './list/list.component';
import { DetailComponent } from './detail/detail.component';
import { AddComponent } from './add/add.component';
import { EditComponent } from './edit/edit.component';

import { TableOrgModule } from 'src/app/components/organisms/quality-customer-org/table-org/table-org.module';
import { SearchOrgModule } from 'src/app/components/organisms/quality-customer-org/search-org/search-org.module';

import { BreadcrumbOrgModule } from 'src/app/components/organisms/breadcrumb-org/breadcrumb-org.module';
import { NewRegistrationLinkOrgModule } from 'src/app/components/organisms/new-registration-link-org/new-registration-link-org.module';
import { LoadingContainerModule } from 'src/app/components/molecules/loading-container/loading-container.module';
import { BackToLinkOrgModule } from 'src/app/components/organisms/back-to-link-org/back-to-link-org.module';
import { EditLinkOrgModule } from 'src/app/components/organisms/edit-link-org/edit-link-org.module';
import { LastUpdaterOrgModule } from 'src/app/components/organisms/last-updater-org/last-updater-org.module';
import { DeleteLinkOrgModule } from 'src/app/components/organisms/delete-link-org/delete-link-org.module';
import { CancelLinkOrgModule } from 'src/app/components/organisms/cancel-link-org/cancel-link-org.module';
import { ButtonModule } from 'src/app/components/atoms/button/button.module';
import { TextContainerModule } from 'src/app/components/molecules/text-container/text-container.module';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonService } from 'src/app/services/shared/common.service';

@NgModule({
  declarations: [
    QualityCustomerComponent,
    ListComponent,
    DetailComponent,
    AddComponent,
    EditComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    BreadcrumbOrgModule,
    NewRegistrationLinkOrgModule,
    TableOrgModule,
    SearchOrgModule,
    LoadingContainerModule,
    BackToLinkOrgModule,
    EditLinkOrgModule,
    LastUpdaterOrgModule,
    DeleteLinkOrgModule,
    QualityCustomerRoutingModule,
    CancelLinkOrgModule,
    ButtonModule,
    TextContainerModule,
    ReactiveFormsModule,
  ],
  providers: [CommonService],
})
export class QualityCustomerModule {}
