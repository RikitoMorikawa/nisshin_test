import { TestBed } from '@angular/core/testing';

import { AccountsReceivableAggregateService } from './accounts-receivable-aggregate.service';

describe('AccountsReceivableAggregateService', () => {
  let service: AccountsReceivableAggregateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AccountsReceivableAggregateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
