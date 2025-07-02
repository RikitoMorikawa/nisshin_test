import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileContainerComponent } from './file-container.component';
import { LabelModule } from 'src/app/components/atoms/label/label.module';
import { FileModule } from 'src/app/components/atoms/file/file.module';

@NgModule({
  declarations: [FileContainerComponent],
  exports: [FileContainerComponent],
  imports: [CommonModule, LabelModule, FileModule],
})
export class FileContainerModule {}
