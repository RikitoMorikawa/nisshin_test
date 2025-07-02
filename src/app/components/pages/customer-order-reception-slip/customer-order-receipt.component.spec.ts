import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerOrderReceptionSlipComponent } from './customer-order-reception-slip.component';

describe('CustomerOrderReceiptComponent', () => {
  let component: CustomerOrderReceptionSlipComponent;
  let fixture: ComponentFixture<CustomerOrderReceptionSlipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CustomerOrderReceptionSlipComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerOrderReceptionSlipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
