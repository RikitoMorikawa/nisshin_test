import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RealTimeSuggestContainerComponent } from './real-time-suggest-container.component';

describe('RealTimeSuggestContainerComponent', () => {
  let component: RealTimeSuggestContainerComponent<{}>;
  let fixture: ComponentFixture<RealTimeSuggestContainerComponent<{}>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RealTimeSuggestContainerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RealTimeSuggestContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
