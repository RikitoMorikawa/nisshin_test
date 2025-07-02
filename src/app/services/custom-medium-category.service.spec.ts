import { TestBed } from '@angular/core/testing';

import { CustomMediumCategoryService } from './custom-medium-category.service';

describe('CustomMediumCategoryService', () => {
  let service: CustomMediumCategoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomMediumCategoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
