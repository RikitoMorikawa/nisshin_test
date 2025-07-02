import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchSuggestContainerComponent } from './search-suggest-container.component';

describe('RealTimeSuggestContainerComponent', () => {
  let component: SearchSuggestContainerComponent<{}>;
  let fixture: ComponentFixture<SearchSuggestContainerComponent<{}>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SearchSuggestContainerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchSuggestContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
