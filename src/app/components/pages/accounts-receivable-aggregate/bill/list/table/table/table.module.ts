import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TableComponent } from './table.component';
import { RouterModule } from '@angular/router';
import { IconModule } from 'src/app/components/atoms/icon/icon.module';
import { ButtonModule } from 'src/app/components/atoms/button/button.module';
import { DateTermModule } from 'src/app/components/molecules/date-term/date-term.module';
import { TextContainerModule } from 'src/app/components/molecules/text-container/text-container.module';

@NgModule({
  declarations: [TableComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    IconModule,
    ButtonModule,
    DateTermModule,
    TextContainerModule,
  ],
  exports: [TableComponent],
})
export class TableModule {}
