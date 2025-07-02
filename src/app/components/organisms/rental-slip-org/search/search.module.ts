import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchComponent } from './search.component';
import { ReactiveFormsModule } from '@angular/forms';
import { InputContainerModule } from 'src/app/components/molecules/input-container/input-container.module';
import { SelectSuggestContainerModule } from 'src/app/components/molecules/select-suggest-container/select-suggest-container.module';
import { SelectContainerModule } from 'src/app/components/molecules/select-container/select-container.module';
import { LoadingContainerModule } from 'src/app/components/molecules/loading-container/loading-container.module';
import { ButtonModule } from 'src/app/components/atoms/button/button.module';
import { IconModule } from 'src/app/components/atoms/icon/icon.module';
import { DateTermClearContainerModule } from 'src/app/components/molecules/date-term-clear-container/date-term-clear-container.module';
import { RealTimeSuggestContainerModule } from '../../../molecules/real-time-suggest-container/real-time-suggest-container.module';

@NgModule({
  declarations: [SearchComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputContainerModule,
    SelectSuggestContainerModule,
    SelectContainerModule,
    LoadingContainerModule,
    ButtonModule,
    IconModule,
    DateTermClearContainerModule,
    RealTimeSuggestContainerModule,
  ],
  exports: [SearchComponent],
})
export class SearchModule {}
