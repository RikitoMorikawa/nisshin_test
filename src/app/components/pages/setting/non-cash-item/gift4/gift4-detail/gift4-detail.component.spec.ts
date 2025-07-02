import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Gift4DetailComponent } from './gift4-detail.component';

describe('Gift4DetailComponent', () => {
  let component: Gift4DetailComponent;
  let fixture: ComponentFixture<Gift4DetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Gift4DetailComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(Gift4DetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
