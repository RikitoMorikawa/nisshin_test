import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PbSecondCategoryComponent } from './pb-second-category.component';

describe('PbSecondCategoryComponent', () => {
  let component: PbSecondCategoryComponent;
  let fixture: ComponentFixture<PbSecondCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PbSecondCategoryComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PbSecondCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
