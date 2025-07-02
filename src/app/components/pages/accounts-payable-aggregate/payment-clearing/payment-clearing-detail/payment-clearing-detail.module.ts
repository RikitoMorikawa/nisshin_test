import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentClearingDetailComponent } from './payment-clearing-detail.component';
import { InputPairComponent } from './input-pair/input-pair.component';
import { ReactiveFormsModule } from '@angular/forms';
import { TitleModule } from '../../../../atoms/title/title.module';
import { TextContainerModule } from '../../../../molecules/text-container/text-container.module';
import { IconModule } from '../../../../atoms/icon/icon.module';
import { DateTermModule } from 'src/app/components/molecules/date-term/date-term.module';
import { DateClearContainerModule } from '../../../../molecules/date-clear-container/date-clear-container.module';
import { SelectClearContainerModule } from '../../../../molecules/select-clear-container/select-clear-container.module';

@NgModule({
  declarations: [PaymentClearingDetailComponent, InputPairComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TitleModule,
    TextContainerModule,
    IconModule,
    DateTermModule,
    DateClearContainerModule,
    SelectClearContainerModule,
  ],
  exports: [PaymentClearingDetailComponent],
})
export class PaymentClearingDetailModule {}
