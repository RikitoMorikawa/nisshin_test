import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientWorkingFieldComponent } from './client-working-field.component';

describe('ClientWorkingFieldComponent', () => {
  let component: ClientWorkingFieldComponent;
  let fixture: ComponentFixture<ClientWorkingFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ClientWorkingFieldComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ClientWorkingFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
