import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreTableOrgComponent } from './store-table-org.component';

describe('StoreTableOrgComponent', () => {
  let component: StoreTableOrgComponent;
  let fixture: ComponentFixture<StoreTableOrgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StoreTableOrgComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StoreTableOrgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
