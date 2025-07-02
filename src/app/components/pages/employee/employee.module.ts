import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { EmployeeComponent } from './employee.component';
import { ListComponent } from './list/list.component';
import { DetailComponent } from './detail/detail.component';
import { EditComponent } from './edit/edit.component';
import { AddComponent } from './add/add.component';

import { EmployeeRoutingModule } from 'src/app/components/pages/employee/employee-routing.module';
import { BreadcrumbOrgModule } from '../../organisms/breadcrumb-org/breadcrumb-org.module';
import { EmployeeTableOrgModule } from 'src/app/components/organisms/employee-org/employee-table-org/employee-table-org.module';
import { EmployeeSearchOrgModule } from '../../organisms/employee-org/employee-search-org/employee-search-org.module';
import { NewRegistrationLinkOrgModule } from '../../organisms/new-registration-link-org/new-registration-link-org.module';
import { BulkRegistrationLinkOrgModule } from '../../organisms/bulk-registration-link-org/bulk-registration-link-org.module';
import { LinkModule } from '../../atoms/link/link.module';
import { BackToLinkOrgModule } from '../../organisms/back-to-link-org/back-to-link-org.module';
import { EditLinkOrgModule } from '../../organisms/edit-link-org/edit-link-org.module';
import { LastUpdaterOrgModule } from '../../organisms/last-updater-org/last-updater-org.module';
import { IconModule } from '../../atoms/icon/icon.module';
import { ButtonModule } from '../../atoms/button/button.module';
import { SelectContainerModule } from '../../molecules/select-container/select-container.module';
import { FileModule } from '../../atoms/file/file.module';
import { IconContainerModule } from '../../molecules/icon-container/icon-container.module';
import { BulkAddComponent } from './bulk-add/bulk-add.component';
import { CancelLinkOrgModule } from '../../organisms/cancel-link-org/cancel-link-org.module';
import { DeleteLinkOrgModule } from '../../organisms/delete-link-org/delete-link-org.module';
import { TextContainerModule } from '../../molecules/text-container/text-container.module';
import { LoadingContainerModule } from '../../molecules/loading-container/loading-container.module';
import { TemplateDownloadLinkOrgModule } from '../../organisms/template-download-link-org/template-download-link-org.module';
import { CommonService } from 'src/app/services/shared/common.service';

@NgModule({
  declarations: [
    ListComponent,
    DetailComponent,
    EditComponent,
    AddComponent,
    BulkAddComponent,
    EmployeeComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    EmployeeRoutingModule,
    EmployeeTableOrgModule,
    NewRegistrationLinkOrgModule,
    BulkRegistrationLinkOrgModule,
    EmployeeSearchOrgModule,
    LinkModule,
    BackToLinkOrgModule,
    EditLinkOrgModule,
    LastUpdaterOrgModule,
    BreadcrumbOrgModule,
    IconModule,
    ButtonModule,
    SelectContainerModule,
    FileModule,
    IconContainerModule,
    CancelLinkOrgModule,
    DeleteLinkOrgModule,
    TextContainerModule,
    LoadingContainerModule,
    TemplateDownloadLinkOrgModule,
  ],
  providers: [CommonService],
})
export class EmployeeModule {}
