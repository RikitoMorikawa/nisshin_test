import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryBulkAddComponent } from './inventory-bulk-add.component';

describe('InventoryBulkAddComponent', () => {
  let component: InventoryBulkAddComponent;
  let fixture: ComponentFixture<InventoryBulkAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InventoryBulkAddComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InventoryBulkAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
