import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkAddComponent } from './bulk-add.component';

describe('BulkAddComponent', () => {
  let component: BulkAddComponent;
  let fixture: ComponentFixture<BulkAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BulkAddComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BulkAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
