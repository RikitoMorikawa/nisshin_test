import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QualityCustomerComponent } from './quality-customer.component';

describe('QualityCustomerComponent', () => {
  let component: QualityCustomerComponent;
  let fixture: ComponentFixture<QualityCustomerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [QualityCustomerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(QualityCustomerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
