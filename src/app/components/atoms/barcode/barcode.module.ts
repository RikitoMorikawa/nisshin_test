import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BarcodeComponent } from './barcode.component';

@NgModule({
  declarations: [BarcodeComponent],
  imports: [CommonModule],
  exports: [BarcodeComponent],
})
export class BarcodeModule {}
