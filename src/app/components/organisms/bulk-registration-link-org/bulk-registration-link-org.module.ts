import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BulkRegistrationLinkOrgComponent } from './bulk-registration-link-org.component';
import { IconContainerModule } from '../../molecules/icon-container/icon-container.module';

@NgModule({
  declarations: [BulkRegistrationLinkOrgComponent],
  imports: [CommonModule, RouterModule, IconContainerModule],
  exports: [BulkRegistrationLinkOrgComponent],
})
export class BulkRegistrationLinkOrgModule {}
