import {
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-file-with-preview',
  templateUrl: './file-with-preview.component.html',
  styleUrls: ['./file-with-preview.component.scss'],
})
export class FileWithPreviewComponent implements OnInit, OnDestroy {
  // 各種変数
  @Input() fileCtrl!: FormControl<File | null>;
  @Input() pathCtrl!: FormControl<string | null>;
  @Input() buttonText = '画像ファイル選択';
  @Input() accept: string = 'image/*';
  imageUrl?: SafeUrl;
  filename?: string;
  required = false;
  timestamp = ''; // IDの代わりに使用
  @ViewChild('input') private input!: ElementRef;
  private subscription = new Subscription();

  /**
   * コンストラクタ
   */
  constructor(private sanitizer: DomSanitizer) {}

  /**
   * コンポーネントの初期化処理
   */
  ngOnInit(): void {
    // 必須判定とIDの生成
    this.required = this.fileCtrl.hasValidator(Validators.required);
    this.timestamp =
      'fileWithPreview' + Date.now() + '' + Math.floor(Math.random() * 100);

    // fileCtrl の変更イベントを購読
    this.subscription.add(
      this.fileCtrl.valueChanges.subscribe((input) => {
        if (input === null) {
          return;
        }
        const url = this.sanitizer.bypassSecurityTrustUrl(
          URL.createObjectURL(input)
        );
        this.imageUrl = url;
        this.filename = input.name;
      })
    );

    // pathCtrl の変更イベントを購読
    this.subscription.add(
      this.pathCtrl.valueChanges.subscribe((input) => {
        this.imageUrl = input ? input : undefined;
        if (!this.fileCtrl.value) {
          this.filename = '現在のロゴ画像';
        }
      })
    );
  }

  /**
   * コンポーネントの終了処理
   */
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /**
   * Input 要素の変更時の処理
   */
  onChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) {
      return;
    }
    this.fileCtrl.markAsTouched();
    this.fileCtrl.markAsDirty();
    this.fileCtrl.setValue(file);
  }

  /**
   * 登録されているロゴ画像を削除
   */
  deleteImage() {
    this.fileCtrl.reset();
    this.pathCtrl.reset();
    this.input.nativeElement.value = '';
  }

  /**
   * FormControl の不正判定
   * @returns boolean
   */
  invalid() {
    return (
      (this.fileCtrl.touched || this.fileCtrl.dirty) && this.fileCtrl.invalid
    );
  }
}
