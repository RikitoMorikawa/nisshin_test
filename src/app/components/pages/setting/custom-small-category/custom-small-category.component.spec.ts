import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomSmallCategoryComponent } from './custom-small-category.component';

describe('CustomSmallCategoryComponent', () => {
  let component: CustomSmallCategoryComponent;
  let fixture: ComponentFixture<CustomSmallCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CustomSmallCategoryComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomSmallCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
