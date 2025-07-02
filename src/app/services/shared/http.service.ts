import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { catchError, of, switchMap } from 'rxjs';
import { errorConst } from 'src/app/const/error.const';
import { modalConst } from 'src/app/const/modal.const';
import { ModalService } from '../modal.service';

@Injectable()
export class HttpService {
  /**
   * ヘッダー情報
   */
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
    params: {},
  };

  /**
   * コンストラクタ
   */
  constructor(protected http: HttpClient, private modal: ModalService) {}

  /**
   * オブジェクトを`FormData`へ変換する。
   * @param json 変換したいオブジェクト。
   * @returns 引数`json`の内容を格納した`FormData`オブジェクト。
   */
  generateFormData(
    json: Record<string, string | number | boolean | null | Blob | object[]>
  ) {
    const formData = new FormData();
    for (let [key, value] of Object.entries(json)) {
      // カスタムタグの配列なら分解して配列形式で格納
      if (value instanceof Array) {
        value.forEach((obj, index) => {
          for (const [cKey, cValue] of Object.entries(obj)) {
            formData.append(`${key}[${index}][${cKey}]`, cValue);
          }
        });
        continue;
      }

      formData.append(
        key,
        value instanceof Blob ? value : value === null ? '' : value + ''
      );
    }
    return formData;
  }

  /**
   * ユーザーへエラーを通知するモーダルを表示し、
   * アプリの動作を止めないよう空のオブジェクトを返却する。
   * @param result observableな結果として返す任意の値。
   * @param title 表示するモーダルのタイトル。
   * @returns `catchError`関数へ渡す関数。
   */
  handleErrorModal<T>(result?: T, title = modalConst.TITLE.HAS_ERROR) {
    return (err: HttpErrorResponse) => {
      this.modal.setModal(
        title,
        `${err.message}\n\n${err.error.message}`,
        'danger',
        '閉じる',
        ''
      );
      return of(result as T);
    };
  }

  /**
   * エラーオブジェクトを受け取り、メッセージを設定して再度スローする関数を返却。
   * @param process エラーメッセージへ設定する処理名（「仕入先情報の取得」など）。
   * @returns `rxjs`の`catchError`関数へ引き渡す関数。
   */
  protected setErrorMessage(process: string) {
    return (err: any) => {
      err.message = process + errorConst.PROCESS_ERROR_TEMPLATE;
      throw err;
    };
  }

  /**
   * `setErrorMessage`と`handleErrorModal`を行う関数を返却。
   * ※ 使用するとエラーを吐かなくなります。
   * @param process エラーメッセージへ設定する処理名（「仕入先情報の取得」など）。
   * @param result observableな結果として返す任意の値。
   * @param title 表示するモーダルのタイトル。
   * @returns `rxjs`の`catchError`関数へ引き渡す関数。
   */
  protected handleError<T>(process: string, result?: T, title?: string) {
    return (err: HttpErrorResponse) =>
      of(err).pipe(
        switchMap(this.setErrorMessage(process)),
        catchError(this.handleErrorModal(result, title))
      );
  }
}
