import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreTableOrgComponent } from './store-table-org.component';
import { TableWithPaginationModule } from 'src/app/components/molecules/table-with-pagination/table-with-pagination.module';

@NgModule({
  declarations: [StoreTableOrgComponent],
  imports: [CommonModule, TableWithPaginationModule],
  exports: [StoreTableOrgComponent],
})
export class StoreTableOrgModule {}
