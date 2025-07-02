import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TextComponent } from './text.component';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [TextComponent],
  imports: [CommonModule, ReactiveFormsModule],
  exports: [TextComponent],
})
export class TextModule {}
