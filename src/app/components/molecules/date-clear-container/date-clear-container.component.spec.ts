import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DateTermComponent } from './date-term.component';

describe('DatetermComponent', () => {
  let component: DateTermComponent;
  let fixture: ComponentFixture<DateTermComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DateTermComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DateTermComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
