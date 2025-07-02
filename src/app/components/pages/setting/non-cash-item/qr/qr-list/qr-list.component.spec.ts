import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QrListComponent } from './qr-list.component';

describe('QrListComponent', () => {
  let component: QrListComponent;
  let fixture: ComponentFixture<QrListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [QrListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(QrListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
