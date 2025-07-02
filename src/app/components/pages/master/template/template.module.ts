import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListComponent } from './list/list.component';
import { ExportLinkComponent } from './list/export-link/export-link.component';
import { IconContainerModule } from 'src/app/components/molecules/icon-container/icon-container.module';
import { ButtonModule } from 'src/app/components/atoms/button/button.module';
import { IconModule } from 'src/app/components/atoms/icon/icon.module';
import { NewRegistrationLinkOrgModule } from 'src/app/components/organisms/new-registration-link-org/new-registration-link-org.module';
import { BulkRegistrationLinkOrgModule } from 'src/app/components/organisms/bulk-registration-link-org/bulk-registration-link-org.module';
import { TableWithPaginationModule } from 'src/app/components/molecules/table-with-pagination/table-with-pagination.module';
import { SearchComponent } from './list/search/search.component';
import { DetailComponent } from './detail/detail.component';
import { DetailListComponent } from './detail/detail-list/detail-list.component';
import { BackToLinkOrgModule } from 'src/app/components/organisms/back-to-link-org/back-to-link-org.module';
import { EditLinkOrgModule } from 'src/app/components/organisms/edit-link-org/edit-link-org.module';
import { DeleteLinkModule } from 'src/app/components/organisms/delete-link/delete-link.module';
import { LastUpdaterOrgModule } from 'src/app/components/organisms/last-updater-org/last-updater-org.module';
import { MasterRoutingModule } from '../master-routing.module';
import { AddEditComponent } from './add-edit/add-edit.component';
import { FormBlockComponent } from './add-edit/form-block/form-block.component';
import { BulkAddComponent } from './bulk-add/bulk-add.component';
import { TemplateDownloadLinkOrgModule } from 'src/app/components/organisms/template-download-link-org/template-download-link-org.module';
import { FileModule } from 'src/app/components/atoms/file/file.module';
import { CancelLinkOrgModule } from 'src/app/components/organisms/cancel-link-org/cancel-link-org.module';

@NgModule({
  declarations: [
    ListComponent,
    ExportLinkComponent,
    SearchComponent,
    DetailComponent,
    DetailListComponent,
    AddEditComponent,
    FormBlockComponent,
    BulkAddComponent,
  ],
  imports: [
    CommonModule,
    MasterRoutingModule,
    IconContainerModule,
    ButtonModule,
    IconModule,
    NewRegistrationLinkOrgModule,
    BulkRegistrationLinkOrgModule,
    TableWithPaginationModule,
    BackToLinkOrgModule,
    EditLinkOrgModule,
    DeleteLinkModule,
    LastUpdaterOrgModule,
    TemplateDownloadLinkOrgModule,
    FileModule,
    CancelLinkOrgModule,
  ],
  exports: [
    ListComponent,
    SearchComponent,
    DetailComponent,
    DetailListComponent,
    AddEditComponent,
    FormBlockComponent,
    BulkAddComponent,
  ],
})
export class TemplateModule {}
