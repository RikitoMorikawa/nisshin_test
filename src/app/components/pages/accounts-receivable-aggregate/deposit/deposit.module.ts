import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { ListComponent } from './list/list.component';
import { AddEditComponent } from './add-edit/add-edit.component';
import { AddComponent } from './add-edit/add.component';
import { SearchComponent } from './list/search/search.component';
import { DepositDetailModule } from './deposit-detail/deposit-detail.module';
import { DepositAddDetailModule } from './deposit-add-detail/deposit-detail.module';
import { DetailViewComponent } from './detail-view/detail-view.component';
import { FormPartsModule } from 'src/app/components/organisms/form-parts/form-parts.module';
import { CustomTagFormModule } from 'src/app/components/organisms/custom-tag-form/custom-tag-form.module';
import { DateClearContainerModule } from 'src/app/components/molecules/date-clear-container/date-clear-container.module';
import { DateTermClearContainerModule } from 'src/app/components/molecules/date-term-clear-container/date-term-clear-container.module';
import { LoadingContainerModule } from '../../../molecules/loading-container/loading-container.module';
import { TableWithPaginationModule } from '../../../molecules/table-with-pagination/table-with-pagination.module';
import { ButtonModule } from '../../../atoms/button/button.module';
import { ToggleButtonModule } from '../toggle-button/toggle-button.module';
import { IconModule } from '../../../atoms/icon/icon.module';
import { SelectClearContainerModule } from '../../../molecules/select-clear-container/select-clear-container.module';
import { BackToLinkOrgModule } from '../../../organisms/back-to-link-org/back-to-link-org.module';
import { EditLinkOrgModule } from '../../../organisms/edit-link-org/edit-link-org.module';
import { NewRegistrationLinkOrgModule } from '../../../organisms/new-registration-link-org/new-registration-link-org.module';
import { ExportLinkModule } from '../export-link/export-link.module';
import { TextContainerModule } from '../../../molecules/text-container/text-container.module';
import { TextareaContainerModule } from '../../../molecules/textarea-container/textarea-container.module';
import { TextClearContainerModule } from '../../../molecules/text-clear-container/text-clear-container.module';
import { BreadcrumbOrgModule } from '../../../organisms/breadcrumb-org/breadcrumb-org.module';
import { IconContainerModule } from '../../../molecules/icon-container/icon-container.module';
import { DeleteLinkOrgModule } from '../../../organisms/delete-link-org/delete-link-org.module';
import { CommonService } from 'src/app/services/shared/common.service';
import { SelectContainerModule } from '../../../molecules/select-container/select-container.module';
import { SelectSuggestContainerModule } from '../../../molecules/select-suggest-container/select-suggest-container.module';
import { CancelLinkOrgModule } from '../../../organisms/cancel-link-org/cancel-link-org.module';
import { LastUpdaterOrgModule } from '../../../organisms/last-updater-org/last-updater-org.module';

@NgModule({
  declarations: [
    ListComponent,
    AddEditComponent,
    AddComponent,
    SearchComponent,
    DetailViewComponent,
  ],
  imports: [
    CommonModule,
    DepositDetailModule,
    DepositAddDetailModule,
    ReactiveFormsModule,
    FormPartsModule,
    CustomTagFormModule,
    IconContainerModule,
    DateClearContainerModule,
    DateTermClearContainerModule,
    CancelLinkOrgModule,
    CommonModule,
    LoadingContainerModule,
    TableWithPaginationModule,
    ButtonModule,
    ToggleButtonModule,
    IconModule,
    SelectClearContainerModule,
    BackToLinkOrgModule,
    EditLinkOrgModule,
    NewRegistrationLinkOrgModule,
    ExportLinkModule,
    TextContainerModule,
    TextareaContainerModule,
    TextClearContainerModule,
    BreadcrumbOrgModule,
    DeleteLinkOrgModule,
    SelectContainerModule,
    SelectSuggestContainerModule,
    LastUpdaterOrgModule,
  ],
  providers: [CommonService],
})
export class DepositModule {}
