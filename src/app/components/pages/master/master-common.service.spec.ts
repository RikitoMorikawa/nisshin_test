import { TestBed } from '@angular/core/testing';

import { MasterCommonService } from './master-common.service';

describe('MasterCommonService', () => {
  let service: MasterCommonService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MasterCommonService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
