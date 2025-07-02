import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Gift1AddComponent } from './gift1-add.component';

describe('Gift1AddComponent', () => {
  let component: Gift1AddComponent;
  let fixture: ComponentFixture<Gift1AddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Gift1AddComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(Gift1AddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
