import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableContainerComponent } from './table-container.component';
import { TitleModule } from 'src/app/components/atoms/title/title.module';
import { SelectModule } from 'src/app/components/atoms/select/select.module';
import { CheckboxModule } from 'src/app/components/atoms/checkbox/checkbox.module';
import { IconModule } from 'src/app/components/atoms/icon/icon.module';
import { LinkModule } from 'src/app/components/atoms/link/link.module';
import { TableModule } from 'src/app/components/atoms/table/table.module';
import { NgxPaginationModule } from 'ngx-pagination';

@NgModule({
  declarations: [TableContainerComponent],
  exports: [TableContainerComponent],
  imports: [
    CommonModule,
    TitleModule,
    SelectModule,
    CheckboxModule,
    IconModule,
    LinkModule,
    NgxPaginationModule,
    TableModule,
  ],
})
export class TableContainerModule {}
