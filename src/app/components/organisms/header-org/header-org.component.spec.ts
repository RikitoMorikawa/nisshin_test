import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderOrgComponent } from './header-org.component';

describe('HeaderOrgComponent', () => {
  let component: HeaderOrgComponent;
  let fixture: ComponentFixture<HeaderOrgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HeaderOrgComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderOrgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
