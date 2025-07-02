import { TestBed } from '@angular/core/testing';

import { CustomSmallCategoryService } from './custom-small-category.service';

describe('CustomSmallCategoryService', () => {
  let service: CustomSmallCategoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomSmallCategoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
