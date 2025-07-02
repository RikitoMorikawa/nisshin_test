import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Gift3ListComponent } from './gift3-list.component';

describe('Gift3ListComponent', () => {
  let component: Gift3ListComponent;
  let fixture: ComponentFixture<Gift3ListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Gift3ListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(Gift3ListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
