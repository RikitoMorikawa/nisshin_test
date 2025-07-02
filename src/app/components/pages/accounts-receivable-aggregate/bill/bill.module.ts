import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { ListComponent } from './list/list.component';
import { SlipListComponent } from './slip-list/slip-list.component';
import { SlipDetailComponent } from './slip-detail/slip-detail.component';
import { SearchComponent as billListSearchComponent } from './list/search/search.component';
import { SearchComponent as SlipListSearchComponent } from './slip-list/search/search.component';
import { SearchComponent as SlipDetailSearchComponent } from './slip-detail/search/search.component';
import { DepositDetailSearchComponent } from './slip-list/deposit-detail-search/deposit-detail-search.component';
import { FormPartsModule } from 'src/app/components/organisms/form-parts/form-parts.module';
import { CustomTagFormModule } from 'src/app/components/organisms/custom-tag-form/custom-tag-form.module';
import { DateClearContainerModule } from 'src/app/components/molecules/date-clear-container/date-clear-container.module';
import { DateTermClearContainerModule } from 'src/app/components/molecules/date-term-clear-container/date-term-clear-container.module';
import { LoadingContainerModule } from '../../../molecules/loading-container/loading-container.module';
import { TableWithPaginationModule } from '../../../molecules/table-with-pagination/table-with-pagination.module';
import { TableContainerModule } from '../../../molecules/table-container/table-container.module';
import { ButtonModule } from '../../../atoms/button/button.module';
import { TableModule } from './list/table/table.module';
import { IconModule } from '../../../atoms/icon/icon.module';
import { ToggleButtonModule } from '../toggle-button/toggle-button.module';
import { SelectClearContainerModule } from '../../../molecules/select-clear-container/select-clear-container.module';
import { BackToLinkOrgModule } from '../../../organisms/back-to-link-org/back-to-link-org.module';
import { NewRegistrationLinkOrgModule } from '../../../organisms/new-registration-link-org/new-registration-link-org.module';
import { LastUpdaterOrgModule } from '../../../organisms/last-updater-org/last-updater-org.module';
import { ExportLinkModule } from 'src/app/components/pages/accounts-receivable-aggregate/export-link/export-link.module';
import { ExportPdfOrgModule } from '../../../organisms/export-pdf-org/export-pdf-org.module';
import { TextClearContainerModule } from '../../../molecules/text-clear-container/text-clear-container.module';
import { BreadcrumbOrgModule } from '../../../organisms/breadcrumb-org/breadcrumb-org.module';
import { IconContainerModule } from '../../../molecules/icon-container/icon-container.module';
import { DeleteLinkOrgModule } from '../../../organisms/delete-link-org/delete-link-org.module';
import { SelectSuggestContainerModule } from '../../../molecules/select-suggest-container/select-suggest-container.module';
import { CommonService } from 'src/app/services/shared/common.service';
import { RealTimeSuggestContainerModule } from '../../../molecules/real-time-suggest-container/real-time-suggest-container.module';
import { SpinnerModule } from 'src/app/components/atoms/spinner/spinner.module';
import { SelectContainerModule } from 'src/app/components/molecules/select-container/select-container.module';

@NgModule({
  declarations: [
    ListComponent,
    SlipListComponent,
    SlipDetailComponent,
    billListSearchComponent,
    SlipListSearchComponent,
    SlipDetailSearchComponent,
    DepositDetailSearchComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormPartsModule,
    CustomTagFormModule,
    IconContainerModule,
    DateClearContainerModule,
    DateTermClearContainerModule,
    CommonModule,
    LoadingContainerModule,
    TableWithPaginationModule,
    TableContainerModule,
    ToggleButtonModule,
    ButtonModule,
    TableModule,
    IconModule,
    SelectClearContainerModule,
    BackToLinkOrgModule,
    NewRegistrationLinkOrgModule,
    LastUpdaterOrgModule,
    ExportLinkModule,
    ExportPdfOrgModule,
    TextClearContainerModule,
    BreadcrumbOrgModule,
    DeleteLinkOrgModule,
    SelectSuggestContainerModule,
    RealTimeSuggestContainerModule,
    SpinnerModule,
    SelectContainerModule,
  ],
})
export class BillModule {}
