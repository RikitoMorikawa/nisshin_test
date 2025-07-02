import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PbFirstCategoryComponent } from './pb-first-category.component';

describe('PbFirstCategoryComponent', () => {
  let component: PbFirstCategoryComponent;
  let fixture: ComponentFixture<PbFirstCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PbFirstCategoryComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PbFirstCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
