import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomTagFormComponent } from './custom-tag-form.component';

describe('CustomTagFormComponent', () => {
  let component: CustomTagFormComponent;
  let fixture: ComponentFixture<CustomTagFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CustomTagFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomTagFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
