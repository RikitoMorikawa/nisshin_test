import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RentalProductComponent } from './rental-product.component';

describe('RentalProductComponent', () => {
  let component: RentalProductComponent;
  let fixture: ComponentFixture<RentalProductComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RentalProductComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RentalProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
