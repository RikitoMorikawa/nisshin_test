import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectSuggestComponent } from './select-suggest.component';

describe('SelectSuggestComponent', () => {
  let component: SelectSuggestComponent;
  let fixture: ComponentFixture<SelectSuggestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SelectSuggestComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectSuggestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
