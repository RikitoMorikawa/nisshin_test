import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PbMainComponent } from './pb-main.component';

describe('PbMainComponent', () => {
  let component: PbMainComponent;
  let fixture: ComponentFixture<PbMainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PbMainComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PbMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
