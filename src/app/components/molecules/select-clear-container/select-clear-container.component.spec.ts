import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectClearContainerComponent } from './select-clear-container.component';

describe('SelectClearContainerComponent', () => {
  let component: SelectClearContainerComponent;
  let fixture: ComponentFixture<SelectClearContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SelectClearContainerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectClearContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
