import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // 追加
import { DeliveryTableOrgComponent } from './delivery-table-org.component';

@NgModule({
  declarations: [DeliveryTableOrgComponent],
  imports: [CommonModule, RouterModule],
  exports: [DeliveryTableOrgComponent],
})
export class DeliveryTableOrgModule {}
