import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExportLinkComponent } from './export-link.component';
import { IconContainerModule } from '../../../molecules/icon-container/icon-container.module';

@NgModule({
  declarations: [ExportLinkComponent],
  imports: [CommonModule, IconContainerModule],
  exports: [ExportLinkComponent],
})
export class ExportLinkModule {}
