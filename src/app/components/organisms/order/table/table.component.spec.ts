import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderTableOrgComponent } from './table.component';

describe('OrderTableOrgComponent', () => {
  let component: OrderTableOrgComponent;
  let fixture: ComponentFixture<OrderTableOrgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OrderTableOrgComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OrderTableOrgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
