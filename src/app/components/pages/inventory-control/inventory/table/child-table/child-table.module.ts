import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChildTableComponent } from './child-table.component';
import { IconModule } from 'src/app/components/atoms/icon/icon.module';
import { RouterModule } from '@angular/router';
import { TextModule } from 'src/app/components/atoms/text/text.module';
import { SpinnerModule } from 'src/app/components/atoms/spinner/spinner.module';

@NgModule({
  declarations: [ChildTableComponent],
  imports: [CommonModule, IconModule, RouterModule, TextModule, SpinnerModule],
  exports: [ChildTableComponent],
})
export class ChildTableModule {}
