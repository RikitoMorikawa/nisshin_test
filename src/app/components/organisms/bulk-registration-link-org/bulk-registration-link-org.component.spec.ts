import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkRegistrationLinkOrgComponent } from './bulk-registration-link-org.component';

describe('BulkRegistrationLinkOrgComponent', () => {
  let component: BulkRegistrationLinkOrgComponent;
  let fixture: ComponentFixture<BulkRegistrationLinkOrgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BulkRegistrationLinkOrgComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BulkRegistrationLinkOrgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
