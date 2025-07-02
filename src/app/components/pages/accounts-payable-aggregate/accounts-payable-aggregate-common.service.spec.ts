import { TestBed } from '@angular/core/testing';

import { AccountsPayableAggregateCommonService } from './accounts-payable-aggregate-common.service';

describe('AccountsPayableAggregateCommonService', () => {
  let service: AccountsPayableAggregateCommonService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AccountsPayableAggregateCommonService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
