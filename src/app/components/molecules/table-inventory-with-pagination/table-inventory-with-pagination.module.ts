import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { TableInventoryWithPaginationComponent } from './table-inventory-with-pagination.component';
import { TitleModule } from '../../atoms/title/title.module';
import { SelectModule } from '../../atoms/select/select.module';
import { TableInventoryModule } from '../../atoms/table-inventory/table-inventory.module';
import { IconModule } from '../../atoms/icon/icon.module';
import { SpinnerModule } from '../../atoms/spinner/spinner.module';

@NgModule({
  declarations: [TableInventoryWithPaginationComponent],
  imports: [
    CommonModule,
    NgxPaginationModule,
    TitleModule,
    SelectModule,
    TableInventoryModule,
    IconModule,
    SpinnerModule,
  ],
  exports: [TableInventoryWithPaginationComponent],
})
export class TableInventoryWithPaginationModule {}
