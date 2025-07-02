import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconContainerComponent } from './icon-container.component';
import { IconModule } from 'src/app/components/atoms/icon/icon.module';

@NgModule({
  declarations: [IconContainerComponent],
  exports: [IconContainerComponent],
  imports: [CommonModule, IconModule],
})
export class IconContainerModule {}
