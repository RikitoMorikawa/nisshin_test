import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Gift3DetailComponent } from './gift3-detail.component';

describe('Gift3DetailComponent', () => {
  let component: Gift3DetailComponent;
  let fixture: ComponentFixture<Gift3DetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Gift3DetailComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(Gift3DetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
