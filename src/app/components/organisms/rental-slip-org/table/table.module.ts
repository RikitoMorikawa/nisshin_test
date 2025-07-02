import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableComponent } from './table.component';
import { TableWithPaginationModule } from 'src/app/components/molecules/table-with-pagination/table-with-pagination.module';
import { ButtonModule } from 'src/app/components/atoms/button/button.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputContainerModule } from 'src/app/components/molecules/input-container/input-container.module';
import { SelectSuggestContainerModule } from 'src/app/components/molecules/select-suggest-container/select-suggest-container.module';
import { SelectContainerModule } from 'src/app/components/molecules/select-container/select-container.module';
import { LoadingContainerModule } from 'src/app/components/molecules/loading-container/loading-container.module';
import { IconModule } from 'src/app/components/atoms/icon/icon.module';

@NgModule({
  declarations: [TableComponent],
  imports: [
    CommonModule,
    TableWithPaginationModule,
    ButtonModule,
    ReactiveFormsModule,
    InputContainerModule,
    SelectSuggestContainerModule,
    SelectContainerModule,
    ButtonModule,
    IconModule,
  ],
  exports: [TableComponent, ReactiveFormsModule],
})
export class TableModule {}
