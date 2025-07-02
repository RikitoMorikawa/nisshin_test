import {
  Component,
  AfterViewInit,
  Input,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-file',
  templateUrl: './file.component.html',
  styleUrls: ['./file.component.scss'],
})
export class FileComponent implements AfterViewInit {
  @Input() formCtrl!: FormControl<File | null>;
  @Input() accept?: string = '*';
  _text = 'ファイル選択';
  @Input() set text(text: string | undefined) {
    if (text) this._text = text;
  }
  @ViewChild('input') input!: ElementRef<HTMLInputElement>;

  constructor() {}

  ngAfterViewInit(): void {
    // formCtrl の値のクリアに合わせて、input 要素の value もクリアする。
    // ※クリアしないと変更が検知できないため、同じファイル名を連続して選択できない。
    this.formCtrl.valueChanges.subscribe((value) => {
      if (!value) {
        this.input.nativeElement.value = '';
      }
    });
  }

  onChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.formCtrl.markAsTouched();
      this.formCtrl.markAsDirty();
      this.formCtrl.setValue(file);
    }
  }
}
