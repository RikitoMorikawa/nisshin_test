import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountsReceivableBalanceComponent } from './accounts-receivable-balance.component';

describe('AccountsReceivableBalanceComponent', () => {
  let component: AccountsReceivableBalanceComponent;
  let fixture: ComponentFixture<AccountsReceivableBalanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AccountsReceivableBalanceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountsReceivableBalanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
