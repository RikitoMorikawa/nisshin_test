import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountsReceivableAggregateComponent } from './accounts-receivable-aggregate.component';

describe('MasterComponent', () => {
  let component: AccountsReceivableAggregateComponent;
  let fixture: ComponentFixture<AccountsReceivableAggregateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AccountsReceivableAggregateComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountsReceivableAggregateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
