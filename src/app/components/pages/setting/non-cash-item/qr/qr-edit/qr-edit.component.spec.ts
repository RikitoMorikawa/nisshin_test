import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QrEditComponent } from './qr-edit.component';

describe('QrEditComponent', () => {
  let component: QrEditComponent;
  let fixture: ComponentFixture<QrEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [QrEditComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(QrEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
