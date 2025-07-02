import { Injectable } from '@angular/core';
import { protectedResources } from 'src/environments/environment';
import { catchError, map, Observable } from 'rxjs';
import { HttpService } from './shared/http.service';
import { PriceChange, PriceChangeApiResponse } from '../models/price-change';
import { SelectOption } from '../components/atoms/select/select.component';
import { HttpHeaders } from '@angular/common/http';

/**
 * 価格変更サービス
 */
@Injectable({
  providedIn: 'root',
})
export class PriceChangeService extends HttpService {
  // 価格変更のエンドポイント
  readonly endpoint = protectedResources.priceChangeApi.endpoint;

  /**
   * 価格変更APIへ`GET`リクエストを送信。
   * @param params 価格変更の絞り込みに使用するパラメータのオブジェクト。
   * @returns レスポンスの`Observable`。
   */
  getAll(params: object = {}): Observable<PriceChangeApiResponse> {
    this.httpOptions.params = params;
    return this.http
      .get<PriceChangeApiResponse>(this.endpoint, this.httpOptions)
      .pipe(catchError(this.setErrorMessage('価格変更一覧の取得')));
  }

  /**
   * `価格変更API/{価格変更id}`へ`GET`リクエストを送信。
   * @param id 取得する価格変更のレコードID。
   * @returns レスポンスの`Observable`。
   */
  find(id: number) {
    return this.http
      .get<PriceChangeApiResponse>(`${this.endpoint}/${id}`)
      .pipe(catchError(this.setErrorMessage('価格変更情報の取得')));
  }

  /**
   * ヘッダに`X-Download`のパラメータを指定してAPIへ`GET`リクエストを送信。
   * @param type 取得するCSVテキストのタイプ。
   * @returns CSV形式のテキストを返す`Observable`。
   */
  getCsv(type: 'template' | 'csv') {
    const options: object = {
      responseType: 'text',
      headers: new HttpHeaders({ 'X-Download': type }),
    };
    return this.http
      .get<string>(this.endpoint, options)
      .pipe(
        catchError(this.setErrorMessage('一括登録用テンプレートファイルの取得'))
      );
  }

  /**
   * 価格変更APIへ`POST`リクエストを送信。
   * @param supplier 登録する価格変更情報を格納したオブジェクト。
   * @return レスポンスの`Observable`。
   */
  add(priceChange: any): Observable<PriceChangeApiResponse> {
    const formData = this.generateFormData(priceChange);
    return this.http
      .post<PriceChangeApiResponse>(this.endpoint, formData)
      .pipe(catchError(this.setErrorMessage('価格変更の登録')));
  }

  /**
   * 価格変更APIへ`POST`リクエストを送信。
   * @param file 一括登録する価格変更情報のCSVファイル。
   * @return レスポンスの`Observable`。
   */
  bulkAdd(file: Blob): Observable<PriceChangeApiResponse> {
    const formData = this.generateFormData({ file });
    return this.http
      .put<PriceChangeApiResponse>(this.endpoint, formData)
      .pipe(catchError(this.setErrorMessage('価格変更情報の一括登録')));
  }

  /**
   * `価格変更API/{価格変更id}`へ`PATCH`リクエストを送信。
   * @param id 更新する価格変更のレコードID。
   * @param supplier 更新する価格変更情報を格納したオブジェクト。
   * @returns レスポンスの`Observable`。
   */
  update(id: number, priceChange: any): Observable<PriceChangeApiResponse> {
    const formData = this.generateFormData(priceChange);
    return this.http
      .patch<PriceChangeApiResponse>(`${this.endpoint}/${id}`, formData)
      .pipe(catchError(this.setErrorMessage('価格変更情報の更新')));
  }

  /**
   * `価格変更API/{価格変更id}`へ`DELETE`リクエストを送信。
   * @param id 削除する価格変更のレコードID。
   * @returns レスポンスの`Observable`。
   */
  remove(id: number): Observable<PriceChangeApiResponse> {
    return this.http
      .delete<PriceChangeApiResponse>(`${this.endpoint}/${id}`)
      .pipe(catchError(this.setErrorMessage('価格変更情報の削除')));
  }

  /**
   * 価格変更APIへGETリクエストを送信し、結果を{'価格変更': SelectOption[]}の配列として返却する
   * @returns {'価格変更': SelectOption[]}のObservable
   */
  //geAsSelectOptions(): Observable<Record<string, SelectOption[]>> {
  //  return this.getAll().pipe(
  //    map((res) => {
  //      let ret = {} as Record<string, SelectOption[]>;
  //      let tempChanges!: PriceChange[];
  //      let priceChanges: SelectOption[] = new Array();
  //      tempChanges = res.data;
  //      tempChanges
  //        .map(({ id, rank_cd }) => ({
  //          value: id,
  //          text: String(rank_cd), // 表示項目は暫定
  //        }))
  //        .map((x) => priceChanges.push(x));
  //      return (ret = { 価格変更: priceChanges });
  //    })
  //  );
  //}
}
