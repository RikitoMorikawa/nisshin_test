import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountsPayableAggregateRoutingModule } from 'src/app/components/pages/accounts-payable-aggregate/accounts-payable-aggregate-routing.module';
import { PaymentCutoffModule } from './payment-cutoff/payment-cutoff.module';
import { PaymentSlipModule } from './payment-slip/payment-slip.module';
import { PaymentClearingModule } from './payment-clearing/payment-clearing.module';
import { AccountsPayableBalanceModule } from './accounts-payable-balance/accounts-payable-balance.module';
import { AccountsPayableAggregateComponent } from './accounts-payable-aggregate.component';
import { BreadcrumbOrgModule } from '../../organisms/breadcrumb-org/breadcrumb-org.module';
import { LoadingContainerModule } from '../../molecules/loading-container/loading-container.module';
import { CommonService } from 'src/app/services/shared/common.service';

@NgModule({
  declarations: [AccountsPayableAggregateComponent],
  imports: [
    CommonModule,
    AccountsPayableAggregateRoutingModule,
    PaymentCutoffModule,
    PaymentSlipModule,
    PaymentClearingModule,
    AccountsPayableBalanceModule,
    BreadcrumbOrgModule,
    LoadingContainerModule,
  ],
  providers: [CommonService],
})
export class AccountsPayableAggregateModule {}
