import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ListComponent } from './list/list.component';
import { SlipListComponent } from './slip-list/slip-list.component';
import { SlipDetailComponent } from './slip-detail/slip-detail.component';
import { RepairSlipDetailComponent } from './repair-slip-detail/repair-slip-detail.component';
import { SearchComponent as SlipDetailSearchComponent } from './slip-detail/search/search.component';
import { SearchComponent as billListSearchComponent } from './list/search/search.component';
import { SearchComponent as SlipListSearchComponent } from './slip-list/search/search.component';
import { RepairSearchComponent as SlipListRepairSearchComponent } from './slip-list/repair-search/repair-search.component';
import { PaymentDetailSearchComponent } from './slip-list/payment-detail-search/payment-detail-search.component';
import { AddEditComponent } from './add-edit/add-edit.component';
import { FormPartsModule } from 'src/app/components/organisms/form-parts/form-parts.module';
import { CustomTagFormModule } from 'src/app/components/organisms/custom-tag-form/custom-tag-form.module';
import { DateClearContainerModule } from 'src/app/components/molecules/date-clear-container/date-clear-container.module';
import { DateTermClearContainerModule } from 'src/app/components/molecules/date-term-clear-container/date-term-clear-container.module';
import { LoadingContainerModule } from '../../../molecules/loading-container/loading-container.module';
import { TableWithPaginationModule } from '../../../molecules/table-with-pagination/table-with-pagination.module';
import { TableContainerModule } from '../../../molecules/table-container/table-container.module';
import { ButtonModule } from '../../../atoms/button/button.module';
import { IconModule } from '../../../atoms/icon/icon.module';
import { ToggleButtonModule } from '../toggle-button/toggle-button.module';
import { SelectClearContainerModule } from '../../../molecules/select-clear-container/select-clear-container.module';
import { BackToLinkOrgModule } from '../../../organisms/back-to-link-org/back-to-link-org.module';
import { NewRegistrationLinkOrgModule } from '../../../organisms/new-registration-link-org/new-registration-link-org.module';
import { LastUpdaterOrgModule } from '../../../organisms/last-updater-org/last-updater-org.module';
import { ExportLinkOrgModule } from '../../../organisms/export-link-org/export-link-org.module';
import { ExportPdfOrgModule } from '../../../organisms/export-pdf-org/export-pdf-org.module';
import { TextClearContainerModule } from '../../../molecules/text-clear-container/text-clear-container.module';
import { BreadcrumbOrgModule } from '../../../organisms/breadcrumb-org/breadcrumb-org.module';
import { IconContainerModule } from '../../../molecules/icon-container/icon-container.module';
import { DeleteLinkOrgModule } from '../../../organisms/delete-link-org/delete-link-org.module';
import { SelectSuggestContainerModule } from '../../../molecules/select-suggest-container/select-suggest-container.module';
import { CommonService } from 'src/app/services/shared/common.service';
import { PaymentDetailDomain } from 'src/app/domains/payment-detail.domain';
import { RepairDomain } from 'src/app/domains/repair.domain';
import { RealTimeSuggestContainerModule } from '../../../molecules/real-time-suggest-container/real-time-suggest-container.module';
import { SpinnerModule } from 'src/app/components/atoms/spinner/spinner.module';
import { SelectContainerModule } from 'src/app/components/molecules/select-container/select-container.module';
import { TitleModule } from 'src/app/components/atoms/title/title.module';
import { TableModule } from 'src/app/components/organisms/purchase-detail-org/table/table.module';
import { TextContainerModule } from 'src/app/components/molecules/text-container/text-container.module';
import { CancelLinkOrgModule } from 'src/app/components/organisms/cancel-link-org/cancel-link-org.module';
import { EditLinkOrgModule } from 'src/app/components/organisms/edit-link-org/edit-link-org.module';
import { CheckboxModule } from '../../../atoms/checkbox/checkbox.module';

@NgModule({
  declarations: [
    ListComponent,
    SlipListComponent,
    SlipDetailComponent,
    RepairSlipDetailComponent,
    billListSearchComponent,
    SlipListSearchComponent,
    SlipListRepairSearchComponent,
    PaymentDetailSearchComponent,
    SlipDetailSearchComponent,
    AddEditComponent,
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
    IconModule,
    SelectClearContainerModule,
    BackToLinkOrgModule,
    NewRegistrationLinkOrgModule,
    LastUpdaterOrgModule,
    ExportLinkOrgModule,
    ExportPdfOrgModule,
    TextClearContainerModule,
    BreadcrumbOrgModule,
    DeleteLinkOrgModule,
    SelectSuggestContainerModule,
    RealTimeSuggestContainerModule,
    SpinnerModule,
    SelectContainerModule,
    TitleModule,
    TableModule,
    TextContainerModule,
    CancelLinkOrgModule,
    EditLinkOrgModule,
    CheckboxModule,
  ],
  providers: [PaymentDetailDomain, RepairDomain],
})
export class PaymentSlipModule {}
