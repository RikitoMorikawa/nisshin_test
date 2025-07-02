import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Gift2ListComponent } from './gift2-list.component';

describe('Gift2ListComponent', () => {
  let component: Gift2ListComponent;
  let fixture: ComponentFixture<Gift2ListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Gift2ListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(Gift2ListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
