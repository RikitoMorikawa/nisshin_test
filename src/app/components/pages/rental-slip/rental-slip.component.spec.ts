import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RentalSlipComponent } from './rental-slip.component';

describe('RentalSlipComponent', () => {
  let component: RentalSlipComponent;
  let fixture: ComponentFixture<RentalSlipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RentalSlipComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RentalSlipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
