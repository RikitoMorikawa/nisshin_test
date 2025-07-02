import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchComponent } from './search.component';
import { ButtonModule } from 'src/app/components/atoms/button/button.module';
import { IconModule } from 'src/app/components/atoms/icon/icon.module';
import { SelectContainerModule } from 'src/app/components/molecules/select-container/select-container.module';
import { TextContainerModule } from 'src/app/components/molecules/text-container/text-container.module';

@NgModule({
  declarations: [SearchComponent],
  imports: [
    CommonModule,
    ButtonModule,
    IconModule,
    SelectContainerModule,
    TextContainerModule,
  ],
  exports: [SearchComponent],
})
export class SearchModule {}
