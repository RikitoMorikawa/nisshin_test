import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableComponent } from './table.component';
import { TableWithPaginationModule } from 'src/app/components/molecules/table-with-pagination/table-with-pagination.module';

@NgModule({
  declarations: [TableComponent],
  imports: [CommonModule, TableWithPaginationModule],
  exports: [TableComponent],
})
export class TableModule {}
