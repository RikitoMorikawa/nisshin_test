import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Gift2EditComponent } from './gift2-edit.component';

describe('Gift2EditComponent', () => {
  let component: Gift2EditComponent;
  let fixture: ComponentFixture<Gift2EditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Gift2EditComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(Gift2EditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
