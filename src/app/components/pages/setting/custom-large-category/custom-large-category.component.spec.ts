import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomLargeCategoryComponent } from './custom-large-category.component';

describe('CustomLargeCategoryComponent', () => {
  let component: CustomLargeCategoryComponent;
  let fixture: ComponentFixture<CustomLargeCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CustomLargeCategoryComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomLargeCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
