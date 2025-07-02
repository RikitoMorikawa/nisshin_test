import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BackToLinkOrgComponent } from './back-to-link-org.component';

describe('BackToListLinkOrgComponent', () => {
  let component: BackToLinkOrgComponent;
  let fixture: ComponentFixture<BackToLinkOrgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BackToLinkOrgComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BackToLinkOrgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
