import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputPairComponent } from './input-pair.component';

describe('InputPairComponent', () => {
  let component: InputPairComponent;
  let fixture: ComponentFixture<InputPairComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InputPairComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InputPairComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
