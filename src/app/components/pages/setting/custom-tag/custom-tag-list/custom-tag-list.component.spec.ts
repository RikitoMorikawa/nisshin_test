import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomTagListComponent } from './custom-tag-list.component';

describe('CustomTagListComponent', () => {
  let component: CustomTagListComponent;
  let fixture: ComponentFixture<CustomTagListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CustomTagListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomTagListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
