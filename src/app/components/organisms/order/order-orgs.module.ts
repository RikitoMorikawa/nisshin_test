import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { SearchComponent } from './search/search.component';
import { TableComponent } from './table/table.component';
import { TextClearContainerModule } from '../../molecules/text-clear-container/text-clear-container.module';
import { SuggestContainerModule } from 'src/app/components/molecules/suggest-container/suggest-container.module';
import { SelectClearContainerModule } from '../../molecules/select-clear-container/select-clear-container.module';
import { DateClearContainerModule } from '../../molecules/date-clear-container/date-clear-container.module';
import { DateTermClearContainerModule } from '../../molecules/date-term-clear-container/date-term-clear-container.module';
import { ButtonModule } from '../../atoms/button/button.module';
import { IconModule } from '../../atoms/icon/icon.module';
import { TableWithPaginationModule } from '../../molecules/table-with-pagination/table-with-pagination.module';
import { TitleModule } from '../../atoms/title/title.module';
import { TextContainerModule } from '../../molecules/text-container/text-container.module';
import { FileContainerModule } from '../../molecules/file-container/file-container.module';
import { SelectContainerModule } from '../../molecules/select-container/select-container.module';
import { TextareaContainerModule } from '../../molecules/textarea-container/textarea-container.module';
import { SelectSuggestContainerModule } from '../../molecules/select-suggest-container/select-suggest-container.module';
import { FormComponent } from './form/form.component';
import { RealTimeSuggestContainerModule } from '../../molecules/real-time-suggest-container/real-time-suggest-container.module';

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
    TableWithPaginationModule,
    CommonModule,
    TitleModule,
    TextContainerModule,
    FileContainerModule,
    SelectContainerModule,
    TextareaContainerModule,
    SelectSuggestContainerModule,
    RealTimeSuggestContainerModule,
  ],
  exports: [SearchComponent, TableComponent, FormComponent],
})
export class OrderOrgsModule {}
