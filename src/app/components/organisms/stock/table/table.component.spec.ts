import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockTableOrgComponent } from './table.component';

describe('StockTableOrgComponent', () => {
  let component: StockTableOrgComponent;
  let fixture: ComponentFixture<StockTableOrgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StockTableOrgComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StockTableOrgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
