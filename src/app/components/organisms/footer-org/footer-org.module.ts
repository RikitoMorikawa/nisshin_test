import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FooterOrgComponent } from './footer-org.component';
import { LabelModule } from 'src/app/components/atoms/label/label.module';

@NgModule({
  declarations: [FooterOrgComponent],
  exports: [FooterOrgComponent],
  imports: [CommonModule, LabelModule],
})
export class FooterOrgModule {}
