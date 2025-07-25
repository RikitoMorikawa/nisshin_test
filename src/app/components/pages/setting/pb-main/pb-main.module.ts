import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { PbMainRoutingModule } from './pb-main-routing.module';
import { PbMainComponent } from './pb-main.component';
import { ListComponent } from './list/list.component';
import { DetailComponent } from './detail/detail.component';
import { EditComponent } from './edit/edit.component';
import { AddComponent } from './add/add.component';
import { BulkAddComponent } from './bulk-add/bulk-add.component';
import { BreadcrumbOrgModule } from 'src/app/components/organisms/breadcrumb-org/breadcrumb-org.module';
import { SearchModule } from './list/search/search.module';
import { TableModule } from './list/table/table.module';
import { NewRegistrationLinkOrgModule } from 'src/app/components/organisms/new-registration-link-org/new-registration-link-org.module';
import { LoadingContainerModule } from 'src/app/components/molecules/loading-container/loading-container.module';
import { BackToLinkOrgModule } from 'src/app/components/organisms/back-to-link-org/back-to-link-org.module';
import { EditLinkOrgModule } from 'src/app/components/organisms/edit-link-org/edit-link-org.module';
import { DeleteLinkOrgModule } from 'src/app/components/organisms/delete-link-org/delete-link-org.module';
import { LastUpdaterOrgModule } from 'src/app/components/organisms/last-updater-org/last-updater-org.module';
import { IconModule } from 'src/app/components/atoms/icon/icon.module';
import { CancelLinkOrgModule } from 'src/app/components/organisms/cancel-link-org/cancel-link-org.module';
import { TextContainerModule } from 'src/app/components/molecules/text-container/text-container.module';
import { ButtonModule } from 'src/app/components/atoms/button/button.module';
import { BulkRegistrationLinkOrgModule } from 'src/app/components/organisms/bulk-registration-link-org/bulk-registration-link-org.module';
import { SelectContainerModule } from 'src/app/components/molecules/select-container/select-container.module';
import { IconContainerModule } from 'src/app/components/molecules/icon-container/icon-container.module';
import { TemplateDownloadLinkOrgModule } from 'src/app/components/organisms/template-download-link-org/template-download-link-org.module';
import { FileModule } from 'src/app/components/atoms/file/file.module';
import { RealTimeSuggestContainerModule } from 'src/app/components/molecules/real-time-suggest-container/real-time-suggest-container.module';
import { FormPartsModule } from 'src/app/components/organisms/form-parts/form-parts.module';
import { CommonService } from 'src/app/services/shared/common.service';

@NgModule({
  declarations: [
    PbMainComponent,
    ListComponent,
    DetailComponent,
    EditComponent,
    AddComponent,
    BulkAddComponent,
  ],
  imports: [
    CommonModule,
    PbMainRoutingModule,
    ReactiveFormsModule,
    BreadcrumbOrgModule,
    SearchModule,
    TableModule,
    NewRegistrationLinkOrgModule,
    LoadingContainerModule,
    BackToLinkOrgModule,
    EditLinkOrgModule,
    DeleteLinkOrgModule,
    LastUpdaterOrgModule,
    IconModule,
    CancelLinkOrgModule,
    TextContainerModule,
    ButtonModule,
    BulkRegistrationLinkOrgModule,
    SelectContainerModule,
    IconContainerModule,
    TemplateDownloadLinkOrgModule,
    FileModule,
    RealTimeSuggestContainerModule,
    FormPartsModule,
  ],
  providers: [CommonService],
})
export class PbMainModule {}
