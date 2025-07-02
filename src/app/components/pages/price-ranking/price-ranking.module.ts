import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PriceRankingRoutingModule } from './price-ranking-routing.module';
import { PriceRankingComponent } from './price-ranking.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ListComponent } from './list/list.component';
import { DetailComponent } from './detail/detail.component';
import { AddComponent } from './add/add.component';
import { BulkAddComponent } from './bulk-add/bulk-add.component';
import { EditComponent } from './edit/edit.component';
import { BreadcrumbOrgModule } from '../../organisms/breadcrumb-org/breadcrumb-org.module';
import { LoadingContainerModule } from '../../molecules/loading-container/loading-container.module';
import { SearchModule } from './list/search/search.module';
import { NewRegistrationLinkOrgModule } from '../../organisms/new-registration-link-org/new-registration-link-org.module';
import { BulkRegistrationLinkOrgModule } from '../../organisms/bulk-registration-link-org/bulk-registration-link-org.module';
import { TableModule } from './list/table/table.module';
import { LastUpdaterOrgModule } from '../../organisms/last-updater-org/last-updater-org.module';
import { RealTimeSuggestContainerModule } from '../../molecules/real-time-suggest-container/real-time-suggest-container.module';
import { SelectContainerModule } from '../../molecules/select-container/select-container.module';
import { TextContainerModule } from '../../molecules/text-container/text-container.module';
import { ButtonModule } from '../../atoms/button/button.module';
import { CancelLinkOrgModule } from '../../organisms/cancel-link-org/cancel-link-org.module';
import { BackToLinkOrgModule } from '../../organisms/back-to-link-org/back-to-link-org.module';
import { EditLinkOrgModule } from '../../organisms/edit-link-org/edit-link-org.module';
import { DeleteLinkOrgModule } from '../../organisms/delete-link-org/delete-link-org.module';
import { TemplateDownloadLinkOrgModule } from '../../organisms/template-download-link-org/template-download-link-org.module';
import { FileModule } from '../../atoms/file/file.module';
import { IconModule } from '../../atoms/icon/icon.module';
import { CommonService } from 'src/app/services/shared/common.service';

@NgModule({
  declarations: [
    PriceRankingComponent,
    ListComponent,
    DetailComponent,
    AddComponent,
    BulkAddComponent,
    EditComponent,
  ],
  imports: [
    CommonModule,
    PriceRankingRoutingModule,
    ReactiveFormsModule,
    BreadcrumbOrgModule,
    LoadingContainerModule,
    SearchModule,
    NewRegistrationLinkOrgModule,
    BulkRegistrationLinkOrgModule,
    TableModule,
    LastUpdaterOrgModule,
    RealTimeSuggestContainerModule,
    SelectContainerModule,
    TextContainerModule,
    ButtonModule,
    CancelLinkOrgModule,
    BackToLinkOrgModule,
    EditLinkOrgModule,
    DeleteLinkOrgModule,
    TemplateDownloadLinkOrgModule,
    FileModule,
    IconModule,
  ],
  providers: [CommonService],
})
export class PriceRankingModule {}
