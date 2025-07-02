import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FooterOrgComponent } from './footer-org.component';

describe('FooterOrgComponent', () => {
  let component: FooterOrgComponent;
  let fixture: ComponentFixture<FooterOrgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FooterOrgComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FooterOrgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
