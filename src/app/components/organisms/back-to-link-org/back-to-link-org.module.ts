import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BackToLinkOrgComponent } from './back-to-link-org.component';
import { IconContainerModule } from '../../molecules/icon-container/icon-container.module';

@NgModule({
  declarations: [BackToLinkOrgComponent],
  imports: [CommonModule, RouterModule, IconContainerModule],
  exports: [BackToLinkOrgComponent],
})
export class BackToLinkOrgModule {}
