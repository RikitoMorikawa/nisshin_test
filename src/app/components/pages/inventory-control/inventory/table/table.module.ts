import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableComponent } from './table.component';
import { TableWithPaginationModule } from 'src/app/components/pages/inventory-control/inventory/table/table-with-pagination/table-with-pagination.module';
import { TitleModule } from 'src/app/components/atoms/title/title.module';

@NgModule({
  declarations: [TableComponent],
  imports: [CommonModule, TableWithPaginationModule, TitleModule],
  exports: [TableComponent],
})
export class TableModule {}
