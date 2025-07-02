import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SalesRoutingModule } from './sales-routing.module';
import { SalesComponent } from './sales.component';
import { SalesListComponent } from './sales-list/sales-list.component';
import { SalesDetailComponent } from './sales-detail/sales-detail.component';
import { LoadingContainerModule } from '../../molecules/loading-container/loading-container.module';
import { TableWithPaginationModule } from '../../molecules/table-with-pagination/table-with-pagination.module';
import { SearchComponent } from './sales-list/search/search.component';
import { ButtonModule } from '../../atoms/button/button.module';
import { IconModule } from '../../atoms/icon/icon.module';
import { SelectClearContainerModule } from '../../molecules/select-clear-container/select-clear-container.module';
import { BackToLinkOrgModule } from '../../organisms/back-to-link-org/back-to-link-org.module';
import { ExportLinkOrgModule } from '../../organisms/export-link-org/export-link-org.module';
import { TextClearContainerModule } from '../../molecules/text-clear-container/text-clear-container.module';
import { BreadcrumbOrgModule } from '../../organisms/breadcrumb-org/breadcrumb-org.module';
import { IconContainerModule } from '../../molecules/icon-container/icon-container.module';
import { SalesSlipComponent } from './sales-slip/sales-slip.component';
import { SalesDetailsComponent } from './sales-details/sales-details.component';
import { DeleteLinkOrgModule } from '../../organisms/delete-link-org/delete-link-org.module';
import { CommonService } from 'src/app/services/shared/common.service';
import { RealTimeSuggestContainerModule } from '../../molecules/real-time-suggest-container/real-time-suggest-container.module';
import { ReactiveFormsModule } from '@angular/forms';
import { FormPartsModule } from 'src/app/components/organisms/form-parts/form-parts.module';
import { SelectSuggestContainerModule } from '../../molecules/select-suggest-container/select-suggest-container.module';
import { DateTermClearContainerModule } from '../../molecules/date-term-clear-container/date-term-clear-container.module';

@NgModule({
  declarations: [
    SalesComponent,
    SalesListComponent,
    SalesDetailComponent,
    SearchComponent,
    SalesSlipComponent,
    SalesDetailsComponent,
  ],
  imports: [
    CommonModule,
    SalesRoutingModule,
    LoadingContainerModule,
    TableWithPaginationModule,
    ButtonModule,
    IconModule,
    SelectClearContainerModule,
    ReactiveFormsModule,
    BackToLinkOrgModule,
    ExportLinkOrgModule,
    TextClearContainerModule,
    BreadcrumbOrgModule,
    IconContainerModule,
    DeleteLinkOrgModule,
    RealTimeSuggestContainerModule,
    FormPartsModule,
    SelectSuggestContainerModule,
    DateTermClearContainerModule,
  ],
  providers: [CommonService],
})
export class SalesModule {}
