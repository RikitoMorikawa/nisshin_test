import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Gift3AddComponent } from './gift3-add.component';

describe('Gift3AddComponent', () => {
  let component: Gift3AddComponent;
  let fixture: ComponentFixture<Gift3AddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Gift3AddComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(Gift3AddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
