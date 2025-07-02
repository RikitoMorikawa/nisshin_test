import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { SearchComponent } from './search.component';
import { LoadingContainerModule } from 'src/app/components/molecules/loading-container/loading-container.module';
import { ButtonModule } from 'src/app/components/atoms/button/button.module';
import { IconModule } from 'src/app/components/atoms/icon/icon.module';
import { RealTimeSuggestContainerModule } from 'src/app/components/molecules/real-time-suggest-container/real-time-suggest-container.module';
import { SelectContainerModule } from 'src/app/components/molecules/select-container/select-container.module';
import { DateTermClearContainerModule } from 'src/app/components/molecules/date-term-clear-container/date-term-clear-container.module';

@NgModule({
  declarations: [SearchComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LoadingContainerModule,
    ButtonModule,
    IconModule,
    RealTimeSuggestContainerModule,
    SelectContainerModule,
    DateTermClearContainerModule,
  ],
  exports: [SearchComponent],
})
export class SearchModule {}
