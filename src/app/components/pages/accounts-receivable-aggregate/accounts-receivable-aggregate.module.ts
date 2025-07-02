import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountsReceivableAggregateRoutingModule } from 'src/app/components/pages/accounts-receivable-aggregate/accounts-receivable-aggregate-routing.module';
import { IndividualBillModule } from './individual-bill/individual-bill.module';
import { BillModule } from './bill/bill.module';
import { DepositModule } from './deposit/deposit.module';
import { AccountsReceivableBalanceModule } from './accounts-receivable-balance/accounts-receivable-balance.module';
import { AccountsReceivableAggregateComponent } from './accounts-receivable-aggregate.component';
import { BreadcrumbOrgModule } from '../../organisms/breadcrumb-org/breadcrumb-org.module';
import { LoadingContainerModule } from '../../molecules/loading-container/loading-container.module';
import { CommonService } from 'src/app/services/shared/common.service';

@NgModule({
  declarations: [AccountsReceivableAggregateComponent],
  imports: [
    CommonModule,
    AccountsReceivableAggregateRoutingModule,
    IndividualBillModule,
    BillModule,
    DepositModule,
    AccountsReceivableBalanceModule,
    BreadcrumbOrgModule,
    LoadingContainerModule,
  ],
  providers: [CommonService],
})
export class AccountsReceivableAggregateModule {}
