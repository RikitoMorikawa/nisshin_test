import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchOrgComponent } from './search-org.component';

describe('SearchOrgComponent', () => {
  let component: SearchOrgComponent;
  let fixture: ComponentFixture<SearchOrgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SearchOrgComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchOrgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
