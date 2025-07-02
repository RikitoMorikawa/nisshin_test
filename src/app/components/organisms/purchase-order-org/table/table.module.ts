import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableWithPaginationModule } from '../../../molecules/table-with-pagination/table-with-pagination.module';

import { TableComponent } from './table.component';
import { ReactiveFormsModule } from '@angular/forms';

import { ButtonModule } from '../../../atoms/button/button.module';
import { CancelLinkOrgModule } from '../../../organisms/cancel-link-org/cancel-link-org.module';

@NgModule({
  declarations: [TableComponent],
  imports: [
    CommonModule,
    TableWithPaginationModule,
    ReactiveFormsModule,
    ButtonModule,
    CancelLinkOrgModule,
  ],
  exports: [TableComponent],
})
export class TableModule {}
