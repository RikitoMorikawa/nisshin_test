import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportPdfOrgComponent } from './export-pdf-org.component';

describe('ExportPdfOrgComponent', () => {
  let component: ExportPdfOrgComponent;
  let fixture: ComponentFixture<ExportPdfOrgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ExportPdfOrgComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ExportPdfOrgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
