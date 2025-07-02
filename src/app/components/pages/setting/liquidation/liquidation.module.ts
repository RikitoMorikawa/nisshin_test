import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LiquidationComponent } from './liquidation.component';
import { AddComponent } from './add/add.component';
import { EditComponent } from './edit/edit.component';
import { DetailComponent } from './detail/detail.component';
import { LiquidationRoutingModule } from './liquidation-routing.module';
import { BreadcrumbOrgModule } from 'src/app/components/organisms/breadcrumb-org/breadcrumb-org.module';
import { BackToLinkOrgModule } from 'src/app/components/organisms/back-to-link-org/back-to-link-org.module';
import { EditLinkOrgModule } from 'src/app/components/organisms/edit-link-org/edit-link-org.module';
import { LastUpdaterOrgModule } from 'src/app/components/organisms/last-updater-org/last-updater-org.module';
import { IconContainerModule } from 'src/app/components/molecules/icon-container/icon-container.module';
import { TextClearContainerModule } from 'src/app/components/molecules/text-clear-container/text-clear-container.module';
import { TextContainerModule } from 'src/app/components/molecules/text-container/text-container.module';
import { TableWithPaginationModule } from 'src/app/components/molecules/table-with-pagination/table-with-pagination.module';
import { SelectClearContainerModule } from 'src/app/components/molecules/select-clear-container/select-clear-container.module';
import { SelectContainerModule } from 'src/app/components/molecules/select-container/select-container.module';
import { SpinnerModule } from 'src/app/components/atoms/spinner/spinner.module';
import { TitleModule } from 'src/app/components/atoms/title/title.module';
import { NewRegistrationLinkOrgModule } from 'src/app/components/organisms/new-registration-link-org/new-registration-link-org.module';
import { BulkRegistrationLinkOrgModule } from 'src/app/components/organisms/bulk-registration-link-org/bulk-registration-link-org.module';
import { LoadingContainerModule } from 'src/app/components/molecules/loading-container/loading-container.module';
import { CancelLinkOrgModule } from 'src/app/components/organisms/cancel-link-org/cancel-link-org.module';
import { ButtonModule } from 'src/app/components/atoms/button/button.module';
import { DeleteLinkModule } from 'src/app/components/organisms/delete-link/delete-link.module';
import { IconModule } from 'src/app/components/atoms/icon/icon.module';
import { FileModule } from 'src/app/components/atoms/file/file.module';
import { TemplateDownloadLinkOrgModule } from 'src/app/components/organisms/template-download-link-org/template-download-link-org.module';
import { FormOrgComponent } from 'src/app/components/pages/setting/liquidation/form-org/form-org.component';

@NgModule({
  declarations: [
    LiquidationComponent,
    AddComponent,
    EditComponent,
    FormOrgComponent,
    DetailComponent,
  ],
  imports: [
    CommonModule,
    LiquidationRoutingModule,
    BreadcrumbOrgModule,
    BackToLinkOrgModule,
    EditLinkOrgModule,
    LastUpdaterOrgModule,
    IconContainerModule,
    TextClearContainerModule,
    TextContainerModule,
    TableWithPaginationModule,
    SelectClearContainerModule,
    SelectContainerModule,
    SpinnerModule,
    TitleModule,
    NewRegistrationLinkOrgModule,
    BulkRegistrationLinkOrgModule,
    LoadingContainerModule,
    CancelLinkOrgModule,
    ButtonModule,
    DeleteLinkModule,
    IconModule,
    FileModule,
    TemplateDownloadLinkOrgModule,
  ],
  exports: [
    LiquidationComponent,
    AddComponent,
    EditComponent,
    FormOrgComponent,
    DetailComponent,
  ],
  //exports: [SupplierComponent, SupplierDetailComponent, SupplierEditComponent],
})
export class LiquidationModule {}
