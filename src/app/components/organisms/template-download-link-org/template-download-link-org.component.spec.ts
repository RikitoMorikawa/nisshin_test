import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplateDownloadLinkOrgComponent } from './template-download-link-org.component';

describe('TemplateDownloadLinkOrgComponent', () => {
  let component: TemplateDownloadLinkOrgComponent;
  let fixture: ComponentFixture<TemplateDownloadLinkOrgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TemplateDownloadLinkOrgComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TemplateDownloadLinkOrgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
