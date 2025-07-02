import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TextareaComponent } from './textarea.component';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [TextareaComponent],
  imports: [CommonModule, ReactiveFormsModule],
  exports: [TextareaComponent],
})
export class TextareaModule {}
