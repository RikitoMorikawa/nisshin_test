import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LastUpdaterOrgComponent } from './last-updater-org.component';
import { IconContainerModule } from '../../molecules/icon-container/icon-container.module';

@NgModule({
  declarations: [LastUpdaterOrgComponent],
  imports: [CommonModule, IconContainerModule],
  exports: [LastUpdaterOrgComponent],
})
export class LastUpdaterOrgModule {}
