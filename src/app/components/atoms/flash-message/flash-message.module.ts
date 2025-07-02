import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FlashMessageComponent } from './flash-message.component';
import { IconModule } from '../icon/icon.module';

@NgModule({
  declarations: [FlashMessageComponent],
  exports: [FlashMessageComponent],
  imports: [CommonModule, IconModule],
})
export class FlashMessageModule {}
