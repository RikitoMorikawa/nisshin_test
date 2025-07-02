import { TestBed } from '@angular/core/testing';

import { RepairSlipService } from './repair-slip.service';

describe('RepairSlipService', () => {
  let service: RepairSlipService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RepairSlipService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
