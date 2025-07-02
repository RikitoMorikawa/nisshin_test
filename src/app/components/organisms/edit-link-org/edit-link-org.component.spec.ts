import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditLinkOrgComponent } from './edit-link-org.component';

describe('EditLinkOrgComponent', () => {
  let component: EditLinkOrgComponent;
  let fixture: ComponentFixture<EditLinkOrgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditLinkOrgComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EditLinkOrgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
