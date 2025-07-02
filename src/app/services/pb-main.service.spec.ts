import { TestBed } from '@angular/core/testing';

import { PbMainService } from './pb-main.service';

describe('PbMainService', () => {
  let service: PbMainService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PbMainService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
