import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PriceChangeRoutingModule } from './price-change-routing.module';
import { ReactiveFormsModule } from '@angular/forms';

import { PriceChangeComponent } from './price-change.component';
import { ListComponent } from './list/list.component';
import { DetailComponent } from './detail/detail.component';
import { EditComponent } from './edit/edit.component';
import { AddComponent } from './add/add.component';

import { TableModule } from './list/table/table.module';
import { SearchModule } from './list/search/search.module';
import { BulkAddComponent } from './bulk-add/bulk-add.component';
import { BreadcrumbOrgModule } from '../../organisms/breadcrumb-org/breadcrumb-org.module';
import { LoadingContainerModule } from '../../molecules/loading-container/loading-container.module';
import { NewRegistrationLinkOrgModule } from '../../organisms/new-registration-link-org/new-registration-link-org.module';
import { BulkRegistrationLinkOrgModule } from '../../organisms/bulk-registration-link-org/bulk-registration-link-org.module';
import { CancelLinkOrgModule } from '../../organisms/cancel-link-org/cancel-link-org.module';
import { LastUpdaterOrgModule } from '../../organisms/last-updater-org/last-updater-org.module';
import { RealTimeSuggestContainerModule } from '../../molecules/real-time-suggest-container/real-time-suggest-container.module';
import { ButtonModule } from '../../atoms/button/button.module';
import { SelectContainerModule } from '../../molecules/select-container/select-container.module';

import { TemplateDownloadLinkOrgModule } from '../../organisms/template-download-link-org/template-download-link-org.module';
import { TextContainerModule } from '../../molecules/text-container/text-container.module';
import { DateTermModule } from '../../molecules/date-term/date-term.module';
import { FileModule } from '../../atoms/file/file.module';
import { IconModule } from '../../atoms/icon/icon.module';
import { BackToLinkOrgModule } from '../../organisms/back-to-link-org/back-to-link-org.module';
import { DeleteLinkOrgModule } from '../../organisms/delete-link-org/delete-link-org.module';
import { EditLinkOrgModule } from '../../organisms/edit-link-org/edit-link-org.module';
import { CommonService } from 'src/app/services/shared/common.service';

@NgModule({
  declarations: [
    PriceChangeComponent,
    ListComponent,
    DetailComponent,
    EditComponent,
    AddComponent,
    BulkAddComponent,
  ],
  imports: [
    CommonModule,
    PriceChangeRoutingModule,
    ReactiveFormsModule,
    TableModule,
    SearchModule,
    BreadcrumbOrgModule,
    LoadingContainerModule,
    NewRegistrationLinkOrgModule,
    BulkRegistrationLinkOrgModule,
    CancelLinkOrgModule,
    LastUpdaterOrgModule,
    RealTimeSuggestContainerModule,
    ButtonModule,
    SelectContainerModule,
    TextContainerModule,
    DateTermModule,
    TemplateDownloadLinkOrgModule,
    FileModule,
    IconModule,
    BackToLinkOrgModule,
    DeleteLinkOrgModule,
    EditLinkOrgModule,
  ],
  providers: [CommonService],
})
export class PriceChangeModule {}
