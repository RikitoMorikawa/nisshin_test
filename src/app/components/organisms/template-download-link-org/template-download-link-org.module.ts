import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TemplateDownloadLinkOrgComponent } from './template-download-link-org.component';
import { IconContainerModule } from '../../molecules/icon-container/icon-container.module';

@NgModule({
  declarations: [TemplateDownloadLinkOrgComponent],
  imports: [CommonModule, IconContainerModule],
  exports: [TemplateDownloadLinkOrgComponent],
})
export class TemplateDownloadLinkOrgModule {}
