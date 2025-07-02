import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderDataCreationComponent } from './order-data-creation.component';

describe('OrderDataCreationComponent', () => {
  let component: OrderDataCreationComponent;
  let fixture: ComponentFixture<OrderDataCreationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OrderDataCreationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OrderDataCreationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
