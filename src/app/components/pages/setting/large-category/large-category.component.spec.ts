import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LargeCategoryComponent } from './large-category.component';

describe('LargeCategoryComponent', () => {
  let component: LargeCategoryComponent;
  let fixture: ComponentFixture<LargeCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LargeCategoryComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LargeCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
