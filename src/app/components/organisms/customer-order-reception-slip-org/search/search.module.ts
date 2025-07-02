import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'src/app/components/atoms/button/button.module';
import { IconModule } from 'src/app/components/atoms/icon/icon.module';
import { TextClearContainerModule } from 'src/app/components/molecules/text-clear-container/text-clear-container.module';
import { SelectSuggestContainerModule } from 'src/app/components/molecules/select-suggest-container/select-suggest-container.module';
import { DateTermClearContainerModule } from 'src/app/components/molecules/date-term-clear-container/date-term-clear-container.module';
import { SelectClearContainerModule } from 'src/app/components/molecules/select-clear-container/select-clear-container.module';
import { SearchComponent } from './search.component';
import { SelectContainerModule } from 'src/app/components/molecules/select-container/select-container.module';

@NgModule({
  declarations: [SearchComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    IconModule,
    TextClearContainerModule,
    SelectSuggestContainerModule,
    DateTermClearContainerModule,
    SelectClearContainerModule,
    SelectContainerModule,
  ],
  exports: [SearchComponent],
})
export class SearchModule {}
