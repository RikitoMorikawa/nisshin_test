import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemberSearchComponent } from './member-search.component';

describe('MemberSearchComponent', () => {
  let component: MemberSearchComponent;
  let fixture: ComponentFixture<MemberSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MemberSearchComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MemberSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
