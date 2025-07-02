import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableWithPaginationComponent } from './table-with-pagination.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { TitleModule } from 'src/app/components/atoms/title/title.module';
import { SelectModule } from 'src/app/components/atoms/select/select.module';
import { ChildTableModule } from '../child-table/child-table.module';
import { SpinnerModule } from 'src/app/components/atoms/spinner/spinner.module';
import { IconModule } from 'src/app/components/atoms/icon/icon.module';

@NgModule({
  declarations: [TableWithPaginationComponent],
  imports: [
    CommonModule,
    ChildTableModule,
    NgxPaginationModule,
    TitleModule,
    SelectModule,
    SpinnerModule,
    IconModule,
  ],
  exports: [TableWithPaginationComponent],
})
export class TableWithPaginationModule {}
