import { TestBed } from '@angular/core/testing';

import { AccountsPayableAggregateService } from './accounts-payable-aggregate.service';

describe('AccountsPayableAggregateService', () => {
  let service: AccountsPayableAggregateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AccountsPayableAggregateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
