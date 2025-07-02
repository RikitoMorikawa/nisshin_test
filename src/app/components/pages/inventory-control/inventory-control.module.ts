import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InventoryControlRoutingModule } from 'src/app/components/pages/inventory-control/inventory-control-routing.module';
import { InventoryControlComponent } from './inventory-control.component';
import { StockComponent } from './stock/stock.component';
import { StockDetailComponent } from './stock-detail/stock-detail.component';
import { InventoryComponent } from 'src/app/components/pages/inventory-control/inventory/inventory.component';
//import { ToggleButtonComponent } from './toggle-button/toggle-button.component';
import { BreadcrumbOrgModule } from '../../organisms/breadcrumb-org/breadcrumb-org.module';
import { SearchModule as StockSearchModule } from './stock/search/search.module';
import { TableModule as StockTableModule } from './stock/table/table.module';
import { TableModule as InventoryGroupTableModule } from './inventory-group/table/table.module';
import { SearchModule as InventoryGroupSearchModule } from './inventory-group/search/search.module';
import { TableModule as InventoryTableModule } from './inventory/table/table.module';
import { SearchModule as InventorySearchModule } from './inventory/search/search.module';
import { LoadingContainerModule } from '../../molecules/loading-container/loading-container.module';
import { BackToLinkOrgModule } from '../../organisms/back-to-link-org/back-to-link-org.module';
import { IconContainerModule } from '../../molecules/icon-container/icon-container.module';
import { ExportPdfOrgModule } from '../../organisms/export-pdf-org/export-pdf-org.module';
import { InventoryGroupComponent } from './inventory-group/inventory-group.component';
import { BulkRegistrationLinkOrgModule } from '../../organisms/bulk-registration-link-org/bulk-registration-link-org.module';
import { InventoryDetailComponent } from './inventory-detail/inventory-detail.component';
import { InventoryBulkAddComponent } from './inventory-bulk-add/inventory-bulk-add.component';
import { LastUpdaterOrgModule } from '../../organisms/last-updater-org/last-updater-org.module';
import { FileModule } from '../../atoms/file/file.module';
import { IconModule } from '../../atoms/icon/icon.module';
import { ButtonModule } from '../../atoms/button/button.module';
import { CommonService } from 'src/app/services/shared/common.service';
import { StockTransferModule } from './stock-transfer/stock-transfer.module';
import { ToggleButtonModule } from './toggle-button/toggle-button.module';

@NgModule({
  declarations: [
    InventoryControlComponent,
    StockComponent,
    StockDetailComponent,
    InventoryComponent,
    //ToggleButtonComponent,
    InventoryGroupComponent,
    InventoryDetailComponent,
    InventoryBulkAddComponent,
  ],
  imports: [
    CommonModule,
    InventoryControlRoutingModule,
    BreadcrumbOrgModule,
    StockSearchModule,
    StockTableModule,
    InventoryTableModule,
    InventorySearchModule,
    InventoryGroupSearchModule,
    LoadingContainerModule,
    BackToLinkOrgModule,
    IconContainerModule,
    ExportPdfOrgModule,
    InventoryGroupTableModule,
    BulkRegistrationLinkOrgModule,
    BackToLinkOrgModule,
    LastUpdaterOrgModule,
    FileModule,
    IconModule,
    ButtonModule,
    StockTransferModule,
    ToggleButtonModule,
  ],
  providers: [CommonService],
})
export class InventoryControlModule {}
