import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Gift4AddComponent } from './gift4-add.component';

describe('Gift4AddComponent', () => {
  let component: Gift4AddComponent;
  let fixture: ComponentFixture<Gift4AddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Gift4AddComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(Gift4AddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
