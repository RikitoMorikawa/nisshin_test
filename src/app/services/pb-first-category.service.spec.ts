import { TestBed } from '@angular/core/testing';

import { PbFirstCategoryService } from './pb-first-category.service';

describe('PbFirstCategoryService', () => {
  let service: PbFirstCategoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PbFirstCategoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
