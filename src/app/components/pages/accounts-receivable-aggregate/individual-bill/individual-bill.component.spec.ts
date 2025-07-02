import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndividualBillComponent } from './individual-bill.component';

describe('IndividualBillComponent', () => {
  let component: IndividualBillComponent;
  let fixture: ComponentFixture<IndividualBillComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IndividualBillComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(IndividualBillComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
