import { TestBed } from '@angular/core/testing';

import { CustomLargeCategoryService } from './custom-large-category.service';

describe('CustomLargeCategoryService', () => {
  let service: CustomLargeCategoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomLargeCategoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
