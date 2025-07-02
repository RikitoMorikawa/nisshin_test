import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QrDetailComponent } from './qr-detail.component';

describe('QrDetailComponent', () => {
  let component: QrDetailComponent;
  let fixture: ComponentFixture<QrDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [QrDetailComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(QrDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
