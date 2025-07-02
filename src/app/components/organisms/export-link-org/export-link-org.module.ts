import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExportLinkOrgComponent } from './export-link-org.component';
import { IconContainerModule } from '../../molecules/icon-container/icon-container.module';

@NgModule({
  declarations: [ExportLinkOrgComponent],
  imports: [CommonModule, IconContainerModule],
  exports: [ExportLinkOrgComponent],
})
export class ExportLinkOrgModule {}
