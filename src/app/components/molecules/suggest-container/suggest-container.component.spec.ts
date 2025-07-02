import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuggestContainerComponent } from './suggest-container.component';

describe('SuggestContainerComponent', () => {
  let component: SuggestContainerComponent;
  let fixture: ComponentFixture<SuggestContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SuggestContainerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SuggestContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
