import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteLinkOrgComponent } from './delete-link-org.component';

describe('DeleteLinkOrgComponent', () => {
  let component: DeleteLinkOrgComponent;
  let fixture: ComponentFixture<DeleteLinkOrgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DeleteLinkOrgComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DeleteLinkOrgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
