import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CancelLinkOrgComponent } from './cancel-link-org.component';
import { IconContainerModule } from '../../molecules/icon-container/icon-container.module';

@NgModule({
  declarations: [CancelLinkOrgComponent],
  imports: [CommonModule, IconContainerModule],
  exports: [CancelLinkOrgComponent],
})
export class CancelLinkOrgModule {}
