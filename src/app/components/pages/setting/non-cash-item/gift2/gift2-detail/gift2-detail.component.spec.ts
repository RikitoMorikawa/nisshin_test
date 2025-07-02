import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Gift2DetailComponent } from './gift2-detail.component';

describe('Gift2DetailComponent', () => {
  let component: Gift2DetailComponent;
  let fixture: ComponentFixture<Gift2DetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Gift2DetailComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(Gift2DetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
