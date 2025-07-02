import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NewRegistrationLinkOrgComponent } from './new-registration-link-org.component';
import { IconContainerModule } from '../../molecules/icon-container/icon-container.module';

@NgModule({
  declarations: [NewRegistrationLinkOrgComponent],
  imports: [CommonModule, RouterModule, IconContainerModule],
  exports: [NewRegistrationLinkOrgComponent],
})
export class NewRegistrationLinkOrgModule {}
