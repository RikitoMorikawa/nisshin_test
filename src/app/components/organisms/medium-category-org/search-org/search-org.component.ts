import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-search-org',
  templateUrl: './search-org.component.html',
  styleUrls: ['./search-org.component.scss'],
})
export class SearchOrgComponent {
  constructor(private formBuilder: FormBuilder) {}

  @Output() searchEvent = new EventEmitter();
  // エラーを親コンポーネントへ送信するEmitterの初期化
  @Output() errorEvent = new EventEmitter<{
    status: number;
    title: string;
    message: string;
  }>();

  // フォームグループ
  searchForm = this.formBuilder.group({
    name: '',
  });

  /**
   * 絞り込みクリアボタンのクリックイベントに対応
   * @returns void
   */
  handleClickClearButton(): void {
    Object.values(this.searchForm.controls).map((x) => x.patchValue(''));
  }

  /**
   * 絞り込み実行ボタンのクリックイベント対応
   * @returns void
   */
  handleClickSubmitButton(): void {
    const searchValue = this.searchForm.value;
    this.searchEvent.emit(searchValue);
  }
}
