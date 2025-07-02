import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Gift1DetailComponent } from './gift1-detail.component';

describe('Gift1DetailComponent', () => {
  let component: Gift1DetailComponent;
  let fixture: ComponentFixture<Gift1DetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Gift1DetailComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(Gift1DetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
