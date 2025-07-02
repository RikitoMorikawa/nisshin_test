import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EditLinkOrgComponent } from './edit-link-org.component';
import { IconContainerModule } from '../../molecules/icon-container/icon-container.module';

@NgModule({
  declarations: [EditLinkOrgComponent],
  imports: [CommonModule, RouterModule, IconContainerModule],
  exports: [EditLinkOrgComponent],
})
export class EditLinkOrgModule {}
