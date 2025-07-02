import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportLinkOrgComponent } from './export-link-org.component';

describe('ExportLinkOrgComponent', () => {
  let component: ExportLinkOrgComponent;
  let fixture: ComponentFixture<ExportLinkOrgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ExportLinkOrgComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ExportLinkOrgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
