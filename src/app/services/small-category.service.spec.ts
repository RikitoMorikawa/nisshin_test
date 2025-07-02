import { TestBed } from '@angular/core/testing';

import { SmallCategoryService } from './small-category.service';

describe('SmallCategoryService', () => {
  let service: SmallCategoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SmallCategoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
