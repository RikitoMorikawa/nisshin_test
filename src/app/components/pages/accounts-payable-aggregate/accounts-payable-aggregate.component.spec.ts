import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountsPayableAggregateComponent } from './accounts-payable-aggregate.component';

describe('AccountsPayableAggregateComponent', () => {
  let component: AccountsPayableAggregateComponent;
  let fixture: ComponentFixture<AccountsPayableAggregateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AccountsPayableAggregateComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountsPayableAggregateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
