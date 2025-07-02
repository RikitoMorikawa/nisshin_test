import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-search-org',
  templateUrl: './search-org.component.html',
  styleUrls: ['./search-org.component.scss'],
})
export class SearchOrgComponent {
  // 検索イベントを親コンポーネントへ送信するEmitter
  @Output() searchEvent = new EventEmitter();
  // エラーを親コンポーネントへ送信するEmitter
  @Output() errorEvent = new EventEmitter<{
    status: number;
    title: string;
    message: string;
  }>();
  // 検索用フォーム
  searchForm = this.formBuilder.group({
    name: '',
  });

  /**
   * コンストラクタ
   * @param formBuilder
   */
  constructor(private formBuilder: FormBuilder) {}

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
