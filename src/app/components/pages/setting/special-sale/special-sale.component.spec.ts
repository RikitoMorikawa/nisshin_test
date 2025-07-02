import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecialSaleComponent } from './special-sale.component';

describe('SpecialSaleComponent', () => {
  let component: SpecialSaleComponent;
  let fixture: ComponentFixture<SpecialSaleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SpecialSaleComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SpecialSaleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
