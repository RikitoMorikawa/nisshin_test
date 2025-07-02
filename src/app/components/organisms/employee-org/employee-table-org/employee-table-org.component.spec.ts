import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeTableOrgComponent } from './employee-table-org.component';

describe('EmployeeTableOrgComponent', () => {
  let component: EmployeeTableOrgComponent;
  let fixture: ComponentFixture<EmployeeTableOrgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EmployeeTableOrgComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EmployeeTableOrgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
