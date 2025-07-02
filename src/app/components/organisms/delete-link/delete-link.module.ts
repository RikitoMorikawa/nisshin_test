import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeleteLinkComponent } from './delete-link.component';
import { IconContainerModule } from '../../molecules/icon-container/icon-container.module';
import { LoadingContainerModule } from '../../molecules/loading-container/loading-container.module';

@NgModule({
  declarations: [DeleteLinkComponent],
  imports: [CommonModule, IconContainerModule, LoadingContainerModule],
  exports: [DeleteLinkComponent],
})
export class DeleteLinkModule {}
