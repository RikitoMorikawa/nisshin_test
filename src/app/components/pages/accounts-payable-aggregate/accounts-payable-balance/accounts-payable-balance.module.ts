import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AccountsPayableBalanceComponent } from './accounts-payable-balance.component';
import { SearchComponent } from './search/search.component';
import { FormPartsModule } from 'src/app/components/organisms/form-parts/form-parts.module';
import { CustomTagFormModule } from 'src/app/components/organisms/custom-tag-form/custom-tag-form.module';
import { DateTermClearContainerModule } from 'src/app/components/molecules/date-term-clear-container/date-term-clear-container.module';
import { LoadingContainerModule } from '../../../molecules/loading-container/loading-container.module';
import { TableWithPaginationModule } from '../../../molecules/table-with-pagination/table-with-pagination.module';
import { ButtonModule } from '../../../atoms/button/button.module';
import { IconModule } from '../../../atoms/icon/icon.module';
import { ToggleButtonModule } from '../toggle-button/toggle-button.module';
import { SelectClearContainerModule } from '../../../molecules/select-clear-container/select-clear-container.module';
import { BackToLinkOrgModule } from '../../../organisms/back-to-link-org/back-to-link-org.module';
import { ExportLinkModule } from '../export-link/export-link.module';
import { TextClearContainerModule } from '../../../molecules/text-clear-container/text-clear-container.module';
import { BreadcrumbOrgModule } from '../../../organisms/breadcrumb-org/breadcrumb-org.module';
import { DeleteLinkOrgModule } from '../../../organisms/delete-link-org/delete-link-org.module';
import { SelectSuggestContainerModule } from '../../../molecules/select-suggest-container/select-suggest-container.module';
import { CommonService } from 'src/app/services/shared/common.service';
import { TextContainerModule } from 'src/app/components/molecules/text-container/text-container.module';

@NgModule({
  declarations: [AccountsPayableBalanceComponent, SearchComponent],
  imports: [
    CommonModule,
    FormPartsModule,
    CustomTagFormModule,
    DateTermClearContainerModule,
    CommonModule,
    LoadingContainerModule,
    TableWithPaginationModule,
    ButtonModule,
    ToggleButtonModule,
    IconModule,
    SelectClearContainerModule,
    BackToLinkOrgModule,
    ExportLinkModule,
    TextClearContainerModule,
    BreadcrumbOrgModule,
    DeleteLinkOrgModule,
    SelectSuggestContainerModule,
    TextContainerModule,
  ],
})
export class AccountsPayableBalanceModule {}
