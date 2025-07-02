import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { SearchSuggestContainerComponent } from './search-suggest-container.component';
import { SpinnerModule } from '../../atoms/spinner/spinner.module';
import { LabelModule } from '../../atoms/label/label.module';
import { IconModule } from '../../atoms/icon/icon.module';
import { ButtonModule } from '../../atoms/button/button.module';

@NgModule({
  declarations: [SearchSuggestContainerComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SpinnerModule,
    LabelModule,
    ButtonModule,
  ],
  exports: [SearchSuggestContainerComponent],
})
export class SearchSuggestContainerModule {}
