import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomTagDetailComponent } from './custom-tag-detail.component';

describe('CustomTagDetailComponent', () => {
  let component: CustomTagDetailComponent;
  let fixture: ComponentFixture<CustomTagDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CustomTagDetailComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomTagDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
