import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectSuggestContainerComponent } from './select-suggest-container.component';

describe('SelectSuggestContainerComponent', () => {
  let component: SelectSuggestContainerComponent;
  let fixture: ComponentFixture<SelectSuggestContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SelectSuggestContainerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectSuggestContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
