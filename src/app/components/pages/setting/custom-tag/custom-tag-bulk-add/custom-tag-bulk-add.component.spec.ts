import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomTagBulkAddComponent } from './custom-tag-bulk-add.component';

describe('CustomTagBulkAddComponent', () => {
  let component: CustomTagBulkAddComponent;
  let fixture: ComponentFixture<CustomTagBulkAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CustomTagBulkAddComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomTagBulkAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
