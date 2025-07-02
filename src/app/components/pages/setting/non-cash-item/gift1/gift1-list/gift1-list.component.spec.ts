import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Gift1ListComponent } from './gift1-list.component';

describe('Gift1ListComponent', () => {
  let component: Gift1ListComponent;
  let fixture: ComponentFixture<Gift1ListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Gift1ListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(Gift1ListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
