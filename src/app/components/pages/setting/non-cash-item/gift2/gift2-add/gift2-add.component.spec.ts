import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Gift2AddComponent } from './gift2-add.component';

describe('Gift2AddComponent', () => {
  let component: Gift2AddComponent;
  let fixture: ComponentFixture<Gift2AddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Gift2AddComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(Gift2AddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
