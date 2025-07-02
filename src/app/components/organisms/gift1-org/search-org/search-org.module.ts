import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { SearchOrgComponent } from './search-org.component';
import { TextContainerModule } from 'src/app/components/molecules/text-container/text-container.module';
import { ButtonModule } from 'src/app/components/atoms/button/button.module';

@NgModule({
  declarations: [SearchOrgComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TextContainerModule,
    ButtonModule,
  ],
  exports: [SearchOrgComponent],
})
export class SearchOrgModule {}
