import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Gift4Component } from './gift4.component';

describe('Gift4Component', () => {
  let component: Gift4Component;
  let fixture: ComponentFixture<Gift4Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Gift4Component],
    }).compileComponents();

    fixture = TestBed.createComponent(Gift4Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
