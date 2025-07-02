import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { TableWithPaginationComponent } from './table-with-pagination.component';
import { TitleModule } from 'src/app/components/atoms/title/title.module';
import { SelectModule } from 'src/app/components/atoms/select/select.module';
import { ChildTableModule } from '../child-table/child-table.module';
import { IconModule } from 'src/app/components/atoms/icon/icon.module';
import { SpinnerModule } from 'src/app/components/atoms/spinner/spinner.module';

@NgModule({
  declarations: [TableWithPaginationComponent],
  imports: [
    CommonModule,
    NgxPaginationModule,
    TitleModule,
    SelectModule,
    ChildTableModule,
    IconModule,
    SpinnerModule,
  ],
  exports: [TableWithPaginationComponent],
})
export class TableWithPaginationModule {}
