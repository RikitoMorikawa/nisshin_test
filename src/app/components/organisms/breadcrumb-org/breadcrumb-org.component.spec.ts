import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BreadcrumbOrgComponent } from './breadcrumb-org.component';

describe('BreadcrumbOrgComponent', () => {
  let component: BreadcrumbOrgComponent;
  let fixture: ComponentFixture<BreadcrumbOrgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BreadcrumbOrgComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BreadcrumbOrgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
