import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MemberTableComponent } from './member-table.component';
import { TableWithPaginationModule } from 'src/app/components/molecules/table-with-pagination/table-with-pagination.module';

@NgModule({
  declarations: [MemberTableComponent],
  imports: [CommonModule, TableWithPaginationModule],
  exports: [MemberTableComponent],
})
export class MemberTableModule {}
