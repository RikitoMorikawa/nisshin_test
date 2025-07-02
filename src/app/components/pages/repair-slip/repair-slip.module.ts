import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RepairSlipRoutingModule } from './repair-slip-routing.module';
import { ListComponent } from './list/list.component';
import { AddComponent } from './add/add.component';
import { EditComponent } from './edit/edit.component';
import { DetailComponent } from './detail/detail.component';
import { RepairSlipComponent } from './repair-slip.component';

import { ReactiveFormsModule } from '@angular/forms';
import { BreadcrumbOrgModule } from '../../organisms/breadcrumb-org/breadcrumb-org.module';
import { NewRegistrationLinkOrgModule } from '../../organisms/new-registration-link-org/new-registration-link-org.module';
import { TableModule } from '../../organisms/repair-slip-org/table/table.module';
import { SearchModule } from '../../organisms/repair-slip-org/search/search.module';
import { LoadingContainerModule } from '../../molecules/loading-container/loading-container.module';
import { CancelLinkOrgModule } from '../../organisms/cancel-link-org/cancel-link-org.module';
import { LastUpdaterOrgModule } from '../../organisms/last-updater-org/last-updater-org.module';
import { SelectSuggestContainerModule } from '../../molecules/select-suggest-container/select-suggest-container.module';
import { DateTermModule } from '../../molecules/date-term/date-term.module';
import { TextContainerModule } from '../../molecules/text-container/text-container.module';
import { TextareaContainerModule } from '../../molecules/textarea-container/textarea-container.module';
import { SelectContainerModule } from '../../molecules/select-container/select-container.module';
import { ButtonModule } from '../../atoms/button/button.module';
import { BackToLinkOrgModule } from '../../organisms/back-to-link-org/back-to-link-org.module';
import { EditLinkOrgModule } from '../../organisms/edit-link-org/edit-link-org.module';
import { DeleteLinkOrgModule } from '../../organisms/delete-link-org/delete-link-org.module';
import { BarcodeModule } from '../../atoms/barcode/barcode.module';
import { IconContainerModule } from '../../molecules/icon-container/icon-container.module';
import { SpinnerModule } from '../../atoms/spinner/spinner.module';
import { CommonService } from 'src/app/services/shared/common.service';
import { RealTimeSuggestContainerModule } from '../../molecules/real-time-suggest-container/real-time-suggest-container.module';
import { CheckboxModule } from '../../atoms/checkbox/checkbox.module';
@NgModule({
  declarations: [
    ListComponent,
    AddComponent,
    EditComponent,
    DetailComponent,
    RepairSlipComponent,
  ],
  imports: [
    CommonModule,
    RepairSlipRoutingModule,
    ReactiveFormsModule,
    BreadcrumbOrgModule,
    NewRegistrationLinkOrgModule,
    TableModule,
    SearchModule,
    LoadingContainerModule,
    CancelLinkOrgModule,
    LastUpdaterOrgModule,
    SelectSuggestContainerModule,
    DateTermModule,
    TextContainerModule,
    TextareaContainerModule,
    SelectContainerModule,
    ButtonModule,
    BackToLinkOrgModule,
    EditLinkOrgModule,
    DeleteLinkOrgModule,
    BarcodeModule,
    IconContainerModule,
    SpinnerModule,
    RealTimeSuggestContainerModule,
    CheckboxModule,
  ],
  providers: [CommonService],
})
export class RepairSlipModule {}
