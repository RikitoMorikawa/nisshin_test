import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleTableOrgComponent } from './role-table-org.component';

describe('RoleTableOrgComponent', () => {
  let component: RoleTableOrgComponent;
  let fixture: ComponentFixture<RoleTableOrgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RoleTableOrgComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RoleTableOrgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
