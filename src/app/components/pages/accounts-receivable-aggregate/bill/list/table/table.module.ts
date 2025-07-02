import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableComponent } from './table.component';
import { TableWithPaginationModule } from './table-with-pagination/table-with-pagination.module';
import { ButtonModule } from '../../../../../atoms/button/button.module';
import { ReactiveFormsModule } from '@angular/forms';
@NgModule({
  declarations: [TableComponent],
  imports: [
    CommonModule,
    TableWithPaginationModule,
    ButtonModule,
    ReactiveFormsModule,
  ],
  exports: [TableComponent],
})
export class TableModule {}
