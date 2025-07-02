import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MediumCategoryComponent } from './medium-category.component';

describe('MediumCategoryComponent', () => {
  let component: MediumCategoryComponent;
  let fixture: ComponentFixture<MediumCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MediumCategoryComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MediumCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
