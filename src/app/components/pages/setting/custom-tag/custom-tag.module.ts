import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CustomTagRoutingModule } from './custom-tag-routing.module';
import { CustomTagComponent } from './custom-tag.component';
import { CustomTagListComponent } from './custom-tag-list/custom-tag-list.component';
import { CustomTagDetailComponent } from './custom-tag-detail/custom-tag-detail.component';
import { LoadingContainerModule } from 'src/app/components/molecules/loading-container/loading-container.module';
import { BreadcrumbOrgModule } from 'src/app/components/organisms/breadcrumb-org/breadcrumb-org.module';
import { CustomTagCommonService } from './custom-tag-common.service';
import { ExportLinkOrgModule } from 'src/app/components/organisms/export-link-org/export-link-org.module';
import { TableWithPaginationModule } from 'src/app/components/molecules/table-with-pagination/table-with-pagination.module';
import { SearchComponent } from './custom-tag-list/search/search.component';
import { ButtonModule } from 'src/app/components/atoms/button/button.module';
import { IconModule } from 'src/app/components/atoms/icon/icon.module';
import { SelectClearContainerModule } from 'src/app/components/molecules/select-clear-container/select-clear-container.module';
import { TextClearContainerModule } from 'src/app/components/molecules/text-clear-container/text-clear-container.module';
import { DateTermClearContainerModule } from 'src/app/components/molecules/date-term-clear-container/date-term-clear-container.module';
import { BackToLinkOrgModule } from 'src/app/components/organisms/back-to-link-org/back-to-link-org.module';
import { EditLinkOrgModule } from 'src/app/components/organisms/edit-link-org/edit-link-org.module';
import { DeleteLinkModule } from 'src/app/components/organisms/delete-link/delete-link.module';
import { LastUpdaterOrgModule } from 'src/app/components/organisms/last-updater-org/last-updater-org.module';
import { TextContainerModule } from 'src/app/components/molecules/text-container/text-container.module';
import { CustomTagAddEditComponent } from './custom-tag-add-edit/custom-tag-add-edit.component';
import { CancelLinkOrgModule } from 'src/app/components/organisms/cancel-link-org/cancel-link-org.module';
import { NewRegistrationLinkOrgModule } from 'src/app/components/organisms/new-registration-link-org/new-registration-link-org.module';
import { CustomTagBulkAddComponent } from './custom-tag-bulk-add/custom-tag-bulk-add.component';
import { BulkRegistrationLinkOrgModule } from 'src/app/components/organisms/bulk-registration-link-org/bulk-registration-link-org.module';
import { TemplateDownloadLinkOrgModule } from 'src/app/components/organisms/template-download-link-org/template-download-link-org.module';
import { FileModule } from 'src/app/components/atoms/file/file.module';
import { CommonService } from 'src/app/services/shared/common.service';

@NgModule({
  declarations: [
    CustomTagComponent,
    CustomTagListComponent,
    CustomTagDetailComponent,
    SearchComponent,
    CustomTagAddEditComponent,
    CustomTagBulkAddComponent,
  ],
  imports: [
    CommonModule,
    CustomTagRoutingModule,
    LoadingContainerModule,
    BreadcrumbOrgModule,
    ExportLinkOrgModule,
    TableWithPaginationModule,
    ButtonModule,
    IconModule,
    SelectClearContainerModule,
    TextClearContainerModule,
    DateTermClearContainerModule,
    BackToLinkOrgModule,
    EditLinkOrgModule,
    DeleteLinkModule,
    LastUpdaterOrgModule,
    TextContainerModule,
    ButtonModule,
    CancelLinkOrgModule,
    NewRegistrationLinkOrgModule,
    BulkRegistrationLinkOrgModule,
    TemplateDownloadLinkOrgModule,
    FileModule,
  ],
  providers: [CustomTagCommonService, CommonService],
})
export class CustomTagModule {}
