import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesSlipComponent } from './sales-slip.component';

describe('SalesSlipComponent', () => {
  let component: SalesSlipComponent;
  let fixture: ComponentFixture<SalesSlipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SalesSlipComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SalesSlipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
