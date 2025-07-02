import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SpecialSaleRoutingModule } from './special-sale-routing.module';
import { SpecialSaleComponent } from './special-sale.component';
import { ListComponent } from './list/list.component';
import { SearchComponent } from './list/search/search.component';
import { ButtonModule } from 'src/app/components/atoms/button/button.module';
import { FileModule } from 'src/app/components/atoms/file/file.module';
import { IconModule } from 'src/app/components/atoms/icon/icon.module';
import { DateTermClearContainerModule } from 'src/app/components/molecules/date-term-clear-container/date-term-clear-container.module';
import { LoadingContainerModule } from 'src/app/components/molecules/loading-container/loading-container.module';
import { SelectClearContainerModule } from 'src/app/components/molecules/select-clear-container/select-clear-container.module';
import { TableWithPaginationModule } from 'src/app/components/molecules/table-with-pagination/table-with-pagination.module';
import { TextClearContainerModule } from 'src/app/components/molecules/text-clear-container/text-clear-container.module';
import { TextContainerModule } from 'src/app/components/molecules/text-container/text-container.module';
import { BackToLinkOrgModule } from 'src/app/components/organisms/back-to-link-org/back-to-link-org.module';
import { BreadcrumbOrgModule } from 'src/app/components/organisms/breadcrumb-org/breadcrumb-org.module';
import { BulkRegistrationLinkOrgModule } from 'src/app/components/organisms/bulk-registration-link-org/bulk-registration-link-org.module';
import { CancelLinkOrgModule } from 'src/app/components/organisms/cancel-link-org/cancel-link-org.module';
import { DeleteLinkModule } from 'src/app/components/organisms/delete-link/delete-link.module';
import { EditLinkOrgModule } from 'src/app/components/organisms/edit-link-org/edit-link-org.module';
import { ExportLinkOrgModule } from 'src/app/components/organisms/export-link-org/export-link-org.module';
import { LastUpdaterOrgModule } from 'src/app/components/organisms/last-updater-org/last-updater-org.module';
import { NewRegistrationLinkOrgModule } from 'src/app/components/organisms/new-registration-link-org/new-registration-link-org.module';
import { TemplateDownloadLinkOrgModule } from 'src/app/components/organisms/template-download-link-org/template-download-link-org.module';
import { SpecialSaleCommonService } from './special-sale-common.service';
import { CommonService } from 'src/app/services/shared/common.service';
import { DetailComponent } from './detail/detail.component';
import { AddEditComponent } from './add-edit/add-edit.component';
import { SelectContainerModule } from 'src/app/components/molecules/select-container/select-container.module';
import { DateTermModule } from 'src/app/components/molecules/date-term/date-term.module';
import { ProductDataComponent } from './add-edit/product-data/product-data.component';
import { BulkAddComponent } from './bulk-add/bulk-add.component';
import { RealTimeSuggestContainerModule } from 'src/app/components/molecules/real-time-suggest-container/real-time-suggest-container.module';

@NgModule({
  declarations: [
    SpecialSaleComponent,
    ListComponent,
    SearchComponent,
    DetailComponent,
    AddEditComponent,
    ProductDataComponent,
    BulkAddComponent,
  ],
  imports: [
    CommonModule,
    SpecialSaleRoutingModule,
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
    SelectContainerModule,
    DateTermModule,
    RealTimeSuggestContainerModule,
  ],
  providers: [SpecialSaleCommonService, CommonService],
})
export class SpecialSaleModule {}
