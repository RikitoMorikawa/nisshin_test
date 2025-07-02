import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QrAddComponent } from './qr-add.component';

describe('QrAddComponent', () => {
  let component: QrAddComponent;
  let fixture: ComponentFixture<QrAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [QrAddComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(QrAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
