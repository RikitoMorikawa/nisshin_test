import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchComponent } from './search.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'src/app/components/atoms/button/button.module';
import { IconModule } from 'src/app/components/atoms/icon/icon.module';
import { TextClearContainerModule } from 'src/app/components/molecules/text-clear-container/text-clear-container.module';
import { SelectSuggestContainerModule } from 'src/app/components/molecules/select-suggest-container/select-suggest-container.module';
import { LoadingContainerModule } from 'src/app/components/molecules/loading-container/loading-container.module';
import { DateTermClearContainerModule } from 'src/app/components/molecules/date-term-clear-container/date-term-clear-container.module';

@NgModule({
  declarations: [SearchComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    IconModule,
    TextClearContainerModule,
    SelectSuggestContainerModule,
    LoadingContainerModule,
    DateTermClearContainerModule,
  ],
  exports: [SearchComponent],
})
export class SearchModule {}
