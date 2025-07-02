import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Gift4EditComponent } from './gift4-edit.component';

describe('Gift4EditComponent', () => {
  let component: Gift4EditComponent;
  let fixture: ComponentFixture<Gift4EditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Gift4EditComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(Gift4EditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
