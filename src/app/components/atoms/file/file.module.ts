import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileComponent } from './file.component';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [FileComponent],
  exports: [FileComponent],
  imports: [CommonModule, ReactiveFormsModule],
})
export class FileModule {}
