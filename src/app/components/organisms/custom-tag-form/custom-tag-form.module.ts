import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomTagFormComponent } from './custom-tag-form.component';
import { InputPairComponent } from './input-pair/input-pair.component';
import { ReactiveFormsModule } from '@angular/forms';
import { TitleModule } from '../../atoms/title/title.module';
import { TextContainerModule } from '../../molecules/text-container/text-container.module';
import { IconModule } from '../../atoms/icon/icon.module';

@NgModule({
  declarations: [CustomTagFormComponent, InputPairComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TitleModule,
    TextContainerModule,
    IconModule,
  ],
  exports: [CustomTagFormComponent],
})
export class CustomTagFormModule {}
