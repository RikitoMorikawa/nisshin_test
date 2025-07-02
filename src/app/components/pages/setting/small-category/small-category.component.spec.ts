import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmallCategoryComponent } from './small-category.component';

describe('SmallCategoryComponent', () => {
  let component: SmallCategoryComponent;
  let fixture: ComponentFixture<SmallCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SmallCategoryComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SmallCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
