import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StockTransferRoutingModule } from './stock-transfer-routing.module';
import { StockTransferComponent } from './stock-transfer.component';
import { AddComponent } from './add/add.component';
import { DetailComponent } from './detail/detail.component';
import { EditComponent } from './edit/edit.component';
import { SearchModule as StockTransferSearchModule } from './search/search.module';
import { TableModule as StockTransferTableModule } from './table/table.module';
import { BreadcrumbOrgModule } from 'src/app/components/organisms/breadcrumb-org/breadcrumb-org.module';
import { CancelLinkOrgModule } from 'src/app/components/organisms/cancel-link-org/cancel-link-org.module';
import { ToggleButtonModule } from '../toggle-button/toggle-button.module';
import { LastUpdaterOrgModule } from 'src/app/components/organisms/last-updater-org/last-updater-org.module';
import { NewRegistrationLinkOrgModule } from 'src/app/components/organisms/new-registration-link-org/new-registration-link-org.module';
import { ReactiveFormsModule } from '@angular/forms';
import { TextContainerModule } from 'src/app/components/molecules/text-container/text-container.module';
import { ButtonModule } from 'src/app/components/atoms/button/button.module';
import { SelectContainerModule } from 'src/app/components/molecules/select-container/select-container.module';
import { RealTimeSuggestContainerModule } from 'src/app/components/molecules/real-time-suggest-container/real-time-suggest-container.module';
import { DateTermModule } from 'src/app/components/molecules/date-term/date-term.module';
import { StockTransferDomain } from 'src/app/domains/stock-transfer.domain';
import { BackToLinkOrgModule } from 'src/app/components/organisms/back-to-link-org/back-to-link-org.module';
import { EditLinkOrgModule } from 'src/app/components/organisms/edit-link-org/edit-link-org.module';
import { DeleteLinkOrgModule } from 'src/app/components/organisms/delete-link-org/delete-link-org.module';

@NgModule({
  declarations: [
    StockTransferComponent,
    AddComponent,
    DetailComponent,
    EditComponent,
  ],
  imports: [
    CommonModule,
    StockTransferRoutingModule,
    BreadcrumbOrgModule,
    StockTransferSearchModule,
    StockTransferTableModule,
    CancelLinkOrgModule,
    LastUpdaterOrgModule,
    NewRegistrationLinkOrgModule,
    ToggleButtonModule,
    ReactiveFormsModule,
    TextContainerModule,
    ButtonModule,
    SelectContainerModule,
    RealTimeSuggestContainerModule,
    DateTermModule,
    BackToLinkOrgModule,
    EditLinkOrgModule,
    DeleteLinkOrgModule,
  ],
  exports: [
    StockTransferComponent,
    AddComponent,
    DetailComponent,
    EditComponent,
  ],
  providers: [StockTransferDomain],
})
export class StockTransferModule {}
