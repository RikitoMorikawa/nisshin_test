import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableOrgComponent } from './table-org.component';
import { TableWithPaginationModule } from 'src/app/components/molecules/table-with-pagination/table-with-pagination.module';

@NgModule({
  declarations: [TableOrgComponent],
  imports: [CommonModule, TableWithPaginationModule],
  exports: [TableOrgComponent],
})
export class TableOrgModule {}
