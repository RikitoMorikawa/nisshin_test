import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Gift3EditComponent } from './gift3-edit.component';

describe('Gift3EditComponent', () => {
  let component: Gift3EditComponent;
  let fixture: ComponentFixture<Gift3EditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Gift3EditComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(Gift3EditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
