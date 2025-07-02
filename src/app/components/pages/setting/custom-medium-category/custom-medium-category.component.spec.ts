import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomMediumCategoryComponent } from './custom-medium-category.component';

describe('CustomMediumCategoryComponent', () => {
  let component: CustomMediumCategoryComponent;
  let fixture: ComponentFixture<CustomMediumCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CustomMediumCategoryComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomMediumCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
