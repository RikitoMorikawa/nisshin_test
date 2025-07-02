import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CancelLinkOrgComponent } from './cancel-link-org.component';

describe('CancelLinkOrgComponent', () => {
  let component: CancelLinkOrgComponent;
  let fixture: ComponentFixture<CancelLinkOrgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CancelLinkOrgComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CancelLinkOrgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
