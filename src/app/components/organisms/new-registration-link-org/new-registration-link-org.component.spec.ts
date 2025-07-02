import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewRegistrationLinkOrgComponent } from './new-registration-link-org.component';

describe('NewRegistrationLinkOrgComponent', () => {
  let component: NewRegistrationLinkOrgComponent;
  let fixture: ComponentFixture<NewRegistrationLinkOrgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NewRegistrationLinkOrgComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NewRegistrationLinkOrgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
