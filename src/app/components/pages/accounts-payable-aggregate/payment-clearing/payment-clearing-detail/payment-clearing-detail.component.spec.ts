import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentClearingDetailComponent } from './payment-clearing-detail.component';

describe('PaymentClearingDetailComponent', () => {
  let component: PaymentClearingDetailComponent;
  let fixture: ComponentFixture<PaymentClearingDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PaymentClearingDetailComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentClearingDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
