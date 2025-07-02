import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MasterRoutingModule } from 'src/app/components/pages/master/master-routing.module';
import { ToggleButtonModule } from './toggle-button/toggle-button.module';
import { SupplierModule } from './supplier/supplier.module';
import { ProductModule } from './product/product.module';
import { ClientModule } from './client/client.module';
import { MasterComponent } from './master.component';
import { BreadcrumbOrgModule } from '../../organisms/breadcrumb-org/breadcrumb-org.module';
import { LoadingContainerModule } from '../../molecules/loading-container/loading-container.module';
import { SupplierProductModule } from './supplier-product/supplier-product.module';
import { CommonService } from 'src/app/services/shared/common.service';

@NgModule({
  declarations: [MasterComponent],
  imports: [
    CommonModule,
    MasterRoutingModule,
    ToggleButtonModule,
    SupplierModule,
    ProductModule,
    ClientModule,
    BreadcrumbOrgModule,
    LoadingContainerModule,
    SupplierProductModule,
  ],
  providers: [CommonService],
})
export class MasterModule {}
