import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MemberSearchComponent } from './member-search.component';

import { LoadingContainerModule } from 'src/app/components/molecules/loading-container/loading-container.module';
import { ButtonModule } from 'src/app/components/atoms/button/button.module';
import { IconModule } from 'src/app/components/atoms/icon/icon.module';
import { TextClearContainerModule } from 'src/app/components/molecules/text-clear-container/text-clear-container.module';
import { SelectClearContainerModule } from 'src/app/components/molecules/select-clear-container/select-clear-container.module';

@NgModule({
  declarations: [MemberSearchComponent],
  imports: [
    CommonModule,
    LoadingContainerModule,
    ButtonModule,
    IconModule,
    TextClearContainerModule,
    SelectClearContainerModule,
    ReactiveFormsModule,
  ],
  exports: [MemberSearchComponent],
})
export class MemberSearchModule {}
