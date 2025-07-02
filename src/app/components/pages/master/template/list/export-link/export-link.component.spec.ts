import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportLinkComponent } from './export-link.component';

describe('ExportLinkComponent', () => {
  let component: ExportLinkComponent;
  let fixture: ComponentFixture<ExportLinkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ExportLinkComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ExportLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
