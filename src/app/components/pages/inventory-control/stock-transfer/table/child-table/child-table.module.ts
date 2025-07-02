import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChildTableComponent } from './child-table.component';
import { RouterModule } from '@angular/router';
import { IconModule } from 'src/app/components/atoms/icon/icon.module';

@NgModule({
  declarations: [ChildTableComponent],
  imports: [CommonModule, RouterModule, IconModule],
  exports: [ChildTableComponent],
})
export class ChildTableModule {}
