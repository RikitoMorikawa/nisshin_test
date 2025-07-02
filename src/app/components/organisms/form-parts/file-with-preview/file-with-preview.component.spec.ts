import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileWithPreviewComponent } from './file-with-preview.component';

describe('FileWithPreviewComponent', () => {
  let component: FileWithPreviewComponent;
  let fixture: ComponentFixture<FileWithPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FileWithPreviewComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FileWithPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
