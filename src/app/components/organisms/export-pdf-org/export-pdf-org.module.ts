import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExportPdfOrgComponent } from './export-pdf-org.component';
import { IconContainerModule } from '../../molecules/icon-container/icon-container.module';

@NgModule({
  declarations: [ExportPdfOrgComponent],
  imports: [CommonModule, IconContainerModule],
  exports: [ExportPdfOrgComponent],
})
export class ExportPdfOrgModule {}
