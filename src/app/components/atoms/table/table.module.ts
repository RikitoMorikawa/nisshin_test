import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableComponent } from './table.component';
import { LinkModule } from '../link/link.module';
import { IconModule } from '../icon/icon.module';
import { TextClearContainerModule } from 'src/app/components/molecules/text-clear-container/text-clear-container.module';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [TableComponent],
  imports: [
    CommonModule,
    LinkModule,
    IconModule,
    TextClearContainerModule,
    RouterModule,
  ],
  exports: [TableComponent],
})
export class TableModule {}
