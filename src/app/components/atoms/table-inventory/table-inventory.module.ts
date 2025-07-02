import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableInventoryComponent } from './table-inventory.component';
import { LinkModule } from '../link/link.module';
import { IconModule } from '../icon/icon.module';
import { TextClearContainerModule } from 'src/app/components/molecules/text-clear-container/text-clear-container.module';

@NgModule({
  declarations: [TableInventoryComponent],
  imports: [CommonModule, LinkModule, IconModule, TextClearContainerModule],
  exports: [TableInventoryComponent],
})
export class TableInventoryModule {}
