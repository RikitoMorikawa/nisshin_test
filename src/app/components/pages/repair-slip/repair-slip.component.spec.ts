import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RepairSlipComponent } from './repair-slip.component';

describe('RepairSlipComponent', () => {
  let component: RepairSlipComponent;
  let fixture: ComponentFixture<RepairSlipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RepairSlipComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RepairSlipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
