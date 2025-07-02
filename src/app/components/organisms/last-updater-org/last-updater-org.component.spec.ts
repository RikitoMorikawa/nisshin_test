import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LastUpdaterOrgComponent } from './last-updater-org.component';

describe('LastUpdaterOrgComponent', () => {
  let component: LastUpdaterOrgComponent;
  let fixture: ComponentFixture<LastUpdaterOrgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LastUpdaterOrgComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LastUpdaterOrgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
