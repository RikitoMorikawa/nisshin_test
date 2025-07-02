import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableWithPaginationComponent } from './table-with-pagination.component';

import { TitleModule } from 'src/app/components/atoms/title/title.module';
import { SelectModule } from 'src/app/components/atoms/select/select.module';
import { NgxPaginationModule } from 'ngx-pagination';
import { IconModule } from 'src/app/components/atoms/icon/icon.module';
import { TableModule } from '../table/table.module';
import { SpinnerModule } from 'src/app/components/atoms/spinner/spinner.module';

@NgModule({
  declarations: [TableWithPaginationComponent],
  imports: [
    CommonModule,
    TitleModule,
    SelectModule,
    NgxPaginationModule,
    IconModule,
    TableModule,
    SpinnerModule,
  ],
  exports: [TableWithPaginationComponent],
})
export class TableWithPaginationModule {}
