import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { SearchComponent } from './search/search.component';
import { TableComponent } from './table/table.component';
import { TextClearContainerModule } from '../../molecules/text-clear-container/text-clear-container.module';
import { CheckboxModule } from 'src/app/components/atoms/checkbox/checkbox.module';
import { SuggestContainerModule } from 'src/app/components/molecules/suggest-container/suggest-container.module';
import { SelectClearContainerModule } from '../../molecules/select-clear-container/select-clear-container.module';
import { DateClearContainerModule } from '../../molecules/date-clear-container/date-clear-container.module';
import { DateTermClearContainerModule } from '../../molecules/date-term-clear-container/date-term-clear-container.module';
import { ButtonModule } from '../../atoms/button/button.module';
import { IconModule } from '../../atoms/icon/icon.module';
import { TableInventoryWithPaginationModule } from '../../molecules/table-inventory-with-pagination/table-inventory-with-pagination.module';
import { TitleModule } from '../../atoms/title/title.module';
import { TextContainerModule } from '../../molecules/text-container/text-container.module';
import { FileContainerModule } from '../../molecules/file-container/file-container.module';
import { SelectContainerModule } from '../../molecules/select-container/select-container.module';
import { TextareaContainerModule } from '../../molecules/textarea-container/textarea-container.module';
import { FormComponent } from './form/form.component';

@NgModule({
  declarations: [SearchComponent, TableComponent, FormComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TextClearContainerModule,
    SuggestContainerModule,
    SelectClearContainerModule,
    DateClearContainerModule,
    DateTermClearContainerModule,
    ButtonModule,
    IconModule,
    CheckboxModule,
    TableInventoryWithPaginationModule,
    CommonModule,
    TitleModule,
    TextContainerModule,
    FileContainerModule,
    SelectContainerModule,
    TextareaContainerModule,
  ],
  exports: [SearchComponent, TableComponent, FormComponent],
})
export class InventoryOrgsModule {}
