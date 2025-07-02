import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MemberRoutingModule } from './member-routing.module';
import { MemberComponent } from './member.component';
import { MemberListComponent } from './member-list/member-list.component';
import { MemberDetailComponent } from './member-detail/member-detail.component';
import { MemberEditComponent } from './member-edit/member-edit.component';
import { MemberAddComponent } from './member-add/member-add.component';
import { BulkAddComponent } from './bulk-add/bulk-add.component';
import { MemberTableModule } from './member-list/member-table/member-table.module';
import { MemberSearchModule } from './member-list/member-search/member-search.module';
import { BreadcrumbOrgModule } from '../../organisms/breadcrumb-org/breadcrumb-org.module';
import { NewRegistrationLinkOrgModule } from '../../organisms/new-registration-link-org/new-registration-link-org.module';
import { BulkRegistrationLinkOrgModule } from '../../organisms/bulk-registration-link-org/bulk-registration-link-org.module';
import { ExportLinkOrgModule } from '../../organisms/export-link-org/export-link-org.module';
import { LoadingContainerModule } from '../../molecules/loading-container/loading-container.module';
import { CancelLinkOrgModule } from '../../organisms/cancel-link-org/cancel-link-org.module';
import { LastUpdaterOrgModule } from '../../organisms/last-updater-org/last-updater-org.module';
import { TextContainerModule } from '../../molecules/text-container/text-container.module';
import { ButtonModule } from '../../atoms/button/button.module';
import { SelectContainerModule } from '../../molecules/select-container/select-container.module';
import { TextareaContainerModule } from '../../molecules/textarea-container/textarea-container.module';
import { TemplateDownloadLinkOrgModule } from '../../organisms/template-download-link-org/template-download-link-org.module';
import { IconContainerModule } from '../../molecules/icon-container/icon-container.module';
import { IconModule } from '../../atoms/icon/icon.module';
import { FileModule } from '../../atoms/file/file.module';
import { BackToLinkOrgModule } from '../../organisms/back-to-link-org/back-to-link-org.module';
import { DeleteLinkModule } from '../../organisms/delete-link/delete-link.module';
import { EditLinkOrgModule } from '../../organisms/edit-link-org/edit-link-org.module';
import { DateTermModule } from '../../molecules/date-term/date-term.module';
import { CommonService } from 'src/app/services/shared/common.service';

@NgModule({
  declarations: [
    MemberComponent,
    MemberListComponent,
    MemberDetailComponent,
    MemberEditComponent,
    MemberAddComponent,
    BulkAddComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MemberRoutingModule,
    MemberTableModule,
    MemberSearchModule,
    BreadcrumbOrgModule,
    NewRegistrationLinkOrgModule,
    BulkRegistrationLinkOrgModule,
    ExportLinkOrgModule,
    LoadingContainerModule,
    CancelLinkOrgModule,
    LastUpdaterOrgModule,
    TextContainerModule,
    ButtonModule,
    SelectContainerModule,
    TextareaContainerModule,
    TemplateDownloadLinkOrgModule,
    IconContainerModule,
    IconModule,
    FileModule,
    BackToLinkOrgModule,
    DeleteLinkModule,
    EditLinkOrgModule,
    DateTermModule,
  ],
  providers: [CommonService],
})
export class MemberModule {}
