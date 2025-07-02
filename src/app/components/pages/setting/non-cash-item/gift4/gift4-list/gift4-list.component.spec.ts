import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Gift4ListComponent } from './gift4-list.component';

describe('Gift4ListComponent', () => {
  let component: Gift4ListComponent;
  let fixture: ComponentFixture<Gift4ListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Gift4ListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(Gift4ListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
