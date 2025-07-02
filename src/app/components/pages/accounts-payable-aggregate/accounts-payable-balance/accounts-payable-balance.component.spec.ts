import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountsPayableBalanceComponent } from './accounts-payable-balance.component';

describe('AccountsPayableBalanceComponent', () => {
  let component: AccountsPayableBalanceComponent;
  let fixture: ComponentFixture<AccountsPayableBalanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AccountsPayableBalanceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountsPayableBalanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
