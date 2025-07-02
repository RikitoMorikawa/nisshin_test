import { TestBed } from '@angular/core/testing';

import { CustomerOrderReceptionSlipService } from './customer-order-reception-slip.service';

describe('CustomerOrderReceptionSlipService', () => {
  let service: CustomerOrderReceptionSlipService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomerOrderReceptionSlipService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
