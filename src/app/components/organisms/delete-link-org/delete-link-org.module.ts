import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeleteLinkOrgComponent } from './delete-link-org.component';
import { IconContainerModule } from '../../molecules/icon-container/icon-container.module';

@NgModule({
  declarations: [DeleteLinkOrgComponent],
  imports: [CommonModule, IconContainerModule],
  exports: [DeleteLinkOrgComponent],
})
export class DeleteLinkOrgModule {}
