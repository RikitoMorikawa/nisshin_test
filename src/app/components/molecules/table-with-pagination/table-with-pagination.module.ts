import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { TableWithPaginationComponent } from './table-with-pagination.component';
import { TitleModule } from '../../atoms/title/title.module';
import { SelectModule } from '../../atoms/select/select.module';
import { TableModule } from '../../atoms/table/table.module';
import { IconModule } from '../../atoms/icon/icon.module';
import { SpinnerModule } from '../../atoms/spinner/spinner.module';

@NgModule({
  declarations: [TableWithPaginationComponent],
  imports: [
    CommonModule,
    NgxPaginationModule,
    TitleModule,
    SelectModule,
    TableModule,
    IconModule,
    SpinnerModule,
  ],
  exports: [TableWithPaginationComponent],
})
export class TableWithPaginationModule {}
