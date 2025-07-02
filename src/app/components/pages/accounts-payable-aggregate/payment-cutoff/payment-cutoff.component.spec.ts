import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentCutoffComponent } from './payment-cutoff.component';

describe('PaymentCutoffComponent', () => {
  let component: PaymentCutoffComponent;
  let fixture: ComponentFixture<PaymentCutoffComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PaymentCutoffComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentCutoffComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
