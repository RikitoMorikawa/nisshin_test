import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextClearContainerComponent } from './text-clear-container.component';

describe('TextClearContainerComponent', () => {
  let component: TextClearContainerComponent;
  let fixture: ComponentFixture<TextClearContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TextClearContainerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TextClearContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
