import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderComponent } from './order.component';
import { OrderRoutingModule } from './order-routing.module';
import { DetailComponent } from './detail/detail.component';
import { BreadcrumbOrgModule } from 'src/app/components/organisms/breadcrumb-org/breadcrumb-org.module';
import { BackToLinkOrgModule } from 'src/app/components/organisms/back-to-link-org/back-to-link-org.module';
import { EditLinkOrgModule } from 'src/app/components/organisms/edit-link-org/edit-link-org.module';
import { LastUpdaterOrgModule } from 'src/app/components/organisms/last-updater-org/last-updater-org.module';
import { IconContainerModule } from 'src/app/components/molecules/icon-container/icon-container.module';
import { OrderOrgsModule } from 'src/app/components/organisms/order/order-orgs.module';
import { SpinnerModule } from 'src/app/components/atoms/spinner/spinner.module';
import { NewRegistrationLinkOrgModule } from 'src/app/components/organisms/new-registration-link-org/new-registration-link-org.module';
import { BulkRegistrationLinkOrgModule } from 'src/app/components/organisms/bulk-registration-link-org/bulk-registration-link-org.module';
import { ExportLinkOrgModule } from 'src/app/components/organisms/export-link-org/export-link-org.module';
import { LoadingContainerModule } from 'src/app/components/molecules/loading-container/loading-container.module';
import { CancelLinkOrgModule } from 'src/app/components/organisms/cancel-link-org/cancel-link-org.module';
import { ButtonModule } from 'src/app/components/atoms/button/button.module';
import { DeleteLinkModule } from 'src/app/components/organisms/delete-link/delete-link.module';
import { IconModule } from 'src/app/components/atoms/icon/icon.module';
import { FileModule } from 'src/app/components/atoms/file/file.module';
import { TemplateDownloadLinkOrgModule } from 'src/app/components/organisms/template-download-link-org/template-download-link-org.module';
import { ListComponent } from './list/list.component';
import { CommonService } from 'src/app/services/shared/common.service';

@NgModule({
  declarations: [OrderComponent, DetailComponent, ListComponent],
  imports: [
    CommonModule,
    OrderRoutingModule,
    BreadcrumbOrgModule,
    BackToLinkOrgModule,
    EditLinkOrgModule,
    LastUpdaterOrgModule,
    IconContainerModule,
    OrderOrgsModule,
    SpinnerModule,
    NewRegistrationLinkOrgModule,
    BulkRegistrationLinkOrgModule,
    ExportLinkOrgModule,
    LoadingContainerModule,
    CancelLinkOrgModule,
    ButtonModule,
    DeleteLinkModule,
    IconModule,
    FileModule,
    TemplateDownloadLinkOrgModule,
  ],
  exports: [OrderComponent, DetailComponent, ListComponent],
  providers: [CommonService],
})
export class OrderModule {}
