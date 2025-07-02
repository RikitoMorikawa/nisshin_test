import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomTagAddEditComponent } from './custom-tag-add-edit.component';

describe('CustomTagAddEditComponent', () => {
  let component: CustomTagAddEditComponent;
  let fixture: ComponentFixture<CustomTagAddEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CustomTagAddEditComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomTagAddEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
