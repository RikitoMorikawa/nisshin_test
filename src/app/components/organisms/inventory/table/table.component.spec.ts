import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryTableOrgComponent } from './table.component';

describe('InventoryTableOrgComponent', () => {
  let component: InventoryTableOrgComponent;
  let fixture: ComponentFixture<InventoryTableOrgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InventoryTableOrgComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InventoryTableOrgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
