import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeSearchOrgComponent } from './employee-search-org.component';

describe('EmployeeSearchOrgComponent', () => {
  let component: EmployeeSearchOrgComponent;
  let fixture: ComponentFixture<EmployeeSearchOrgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EmployeeSearchOrgComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EmployeeSearchOrgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
