import { TestBed } from '@angular/core/testing';

import { PbSecondCategoryService } from './pb-second-category.service';

describe('PbSecondCategoryService', () => {
  let service: PbSecondCategoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PbSecondCategoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
