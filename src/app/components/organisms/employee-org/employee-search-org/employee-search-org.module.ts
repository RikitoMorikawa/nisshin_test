import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { EmployeeSearchOrgComponent } from './employee-search-org.component';
import { TextClearContainerModule } from '../../../molecules/text-clear-container/text-clear-container.module';
import { SelectClearContainerModule } from '../../../molecules/select-clear-container/select-clear-container.module';
import { ButtonModule } from '../../../atoms/button/button.module';
import { IconModule } from '../../../atoms/icon/icon.module';

@NgModule({
  declarations: [EmployeeSearchOrgComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TextClearContainerModule,
    SelectClearContainerModule,
    ButtonModule,
    IconModule,
  ],
  exports: [EmployeeSearchOrgComponent],
})
export class EmployeeSearchOrgModule {}
