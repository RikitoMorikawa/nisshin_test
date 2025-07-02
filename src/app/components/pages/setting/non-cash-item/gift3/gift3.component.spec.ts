import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Gift3Component } from './gift3.component';

describe('Gift3Component', () => {
  let component: Gift3Component;
  let fixture: ComponentFixture<Gift3Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Gift3Component],
    }).compileComponents();

    fixture = TestBed.createComponent(Gift3Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
