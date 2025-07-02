import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { SearchComponent } from './search.component';
import { LoadingContainerModule } from 'src/app/components/molecules/loading-container/loading-container.module';
import { ButtonModule } from 'src/app/components/atoms/button/button.module';
import { IconModule } from 'src/app/components/atoms/icon/icon.module';
import { TextContainerModule } from 'src/app/components/molecules/text-container/text-container.module';
import { SelectSuggestContainerModule } from 'src/app/components/molecules/select-suggest-container/select-suggest-container.module';
import { DateTermClearContainerModule } from 'src/app/components/molecules/date-term-clear-container/date-term-clear-container.module';

@NgModule({
  declarations: [SearchComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LoadingContainerModule,
    ButtonModule,
    IconModule,
    TextContainerModule,
    SelectSuggestContainerModule,
    DateTermClearContainerModule,
  ],
  exports: [SearchComponent],
})
export class SearchModule {}
