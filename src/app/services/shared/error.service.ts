import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ErrorService {
  // エラーイベント購読・ストリーム流し込み共通インスタンス
  private _errorEvent$ = new Subject<{
    status: number;
    title: string;
    message: string;
    redirectPath?: string;
  }>();

  constructor() {}

  /**
   * 子コンポーネントでストリームを流し込む
   *
   * this.errorService.setError({ status: エラーから取得したステータスコード, message: エラーから取得したメッセージ , redirectPath?: リダイレクトさせたいパス})
   * @returns Subject
   */
  setError(data: {
    status: number;
    title: string;
    message: string;
    redirectPath?: string;
  }) {
    return this._errorEvent$.next(data);
  }

  /**
   * 親コンポーネントで購読し
   *
   * this.errorService.getError().subscribe(res => エラー対応)
   * @returns Observable
   */
  getError() {
    return this._errorEvent$.asObservable();
  }
}
