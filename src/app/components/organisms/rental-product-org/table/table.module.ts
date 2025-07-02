import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableComponent } from './table.component';
import { TableWithPaginationModule } from 'src/app/components/molecules/table-with-pagination/table-with-pagination.module';
import { ButtonModule } from '../../../atoms/button/button.module';
import { CancelLinkOrgModule } from '../../../organisms/cancel-link-org/cancel-link-org.module';
import { ReactiveFormsModule } from '@angular/forms';
import { SelectContainerModule } from '../../../molecules/select-container/select-container.module';
import { SelectSuggestContainerModule } from '../../../molecules/select-suggest-container/select-suggest-container.module';

@NgModule({
  declarations: [TableComponent],
  imports: [
    CommonModule,
    TableWithPaginationModule,
    ReactiveFormsModule,
    ButtonModule,
    CancelLinkOrgModule,
    SelectContainerModule,
    SelectSuggestContainerModule,
  ],
  exports: [TableComponent],
})
export class TableModule {}
