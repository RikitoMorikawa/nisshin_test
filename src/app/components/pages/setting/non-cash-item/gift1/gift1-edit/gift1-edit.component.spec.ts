import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Gift1EditComponent } from './gift1-edit.component';

describe('Gift1EditComponent', () => {
  let component: Gift1EditComponent;
  let fixture: ComponentFixture<Gift1EditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Gift1EditComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(Gift1EditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
