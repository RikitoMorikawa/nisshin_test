import { TestBed } from '@angular/core/testing';

import { AccountsReceivableAggregateCommonService } from './accounts-receivable-aggregate-common.service';

describe('AccountsReceivableAggregateCommonService', () => {
  let service: AccountsReceivableAggregateCommonService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AccountsReceivableAggregateCommonService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
