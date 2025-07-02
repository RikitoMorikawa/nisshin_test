import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderOrgComponent } from './header-org.component';
import { IconModule } from 'src/app/components/atoms/icon/icon.module';
import { IconContainerModule } from 'src/app/components/molecules/icon-container/icon-container.module';
import { LinkModule } from 'src/app/components/atoms/link/link.module';
import { RouterModule } from '@angular/router';
import { SpinnerModule } from '../../atoms/spinner/spinner.module';

@NgModule({
  declarations: [HeaderOrgComponent],
  exports: [HeaderOrgComponent],
  imports: [
    CommonModule,
    IconModule,
    IconContainerModule,
    LinkModule,
    RouterModule,
    SpinnerModule,
  ],
})
export class HeaderOrgModule {}
