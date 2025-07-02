import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BreadcrumbOrgComponent } from './breadcrumb-org.component';
import { IconContainerModule } from '../../molecules/icon-container/icon-container.module';
import { IconModule } from '../../atoms/icon/icon.module';

@NgModule({
  declarations: [BreadcrumbOrgComponent],
  imports: [CommonModule, RouterModule, IconContainerModule, IconModule],
  exports: [BreadcrumbOrgComponent],
})
export class BreadcrumbOrgModule {}
