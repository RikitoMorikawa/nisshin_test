import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DateTermClearContainerComponent } from './date-term-clear-container.component';

describe('DateTermClearContainerComponent', () => {
  let component: DateTermClearContainerComponent;
  let fixture: ComponentFixture<DateTermClearContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DateTermClearContainerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DateTermClearContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
