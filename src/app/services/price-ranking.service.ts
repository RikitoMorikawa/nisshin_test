import { Injectable } from '@angular/core';
import { protectedResources } from 'src/environments/environment';
import { catchError, map, Observable } from 'rxjs';
import { HttpService } from './shared/http.service';
import { PriceRanking, PriceRankingApiResponse } from '../models/price_ranking';
import { SelectOption } from '../components/atoms/select/select.component';
import { HttpHeaders } from '@angular/common/http';

/**
 * ランク価格サービス
 */
@Injectable({
  providedIn: 'root',
})
export class PriceRankingService extends HttpService {
  // ランク価格のエンドポイント
  readonly endpoint = protectedResources.priceRankingApi.endpoint;

  /**
   * ランク価格APIへ`GET`リクエストを送信。
   * @param params ランク価格の絞り込みに使用するパラメータのオブジェクト。
   * @returns レスポンスの`Observable`。
   */
  getAll(params: object = {}): Observable<PriceRankingApiResponse> {
    this.httpOptions.params = params;
    return this.http
      .get<PriceRankingApiResponse>(this.endpoint, this.httpOptions)
      .pipe(catchError(this.setErrorMessage('ランク価格一覧の取得')));
  }

  /**
   * `ランク価格API/{ランク価格id}`へ`GET`リクエストを送信。
   * @param id 取得するランク価格のレコードID。
   * @returns レスポンスの`Observable`。
   */
  find(id: number) {
    return this.http
      .get<PriceRankingApiResponse>(`${this.endpoint}/${id}`)
      .pipe(catchError(this.setErrorMessage('ランク価格情報の取得')));
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
   * ランク価格APIへ`POST`リクエストを送信。
   * @param supplier 登録するランク価格情報を格納したオブジェクト。
   * @return レスポンスの`Observable`。
   */
  add(priceRanking: any): Observable<PriceRankingApiResponse> {
    const formData = this.generateFormData(priceRanking);
    return this.http
      .post<PriceRankingApiResponse>(this.endpoint, formData)
      .pipe(catchError(this.setErrorMessage('ランク価格の登録')));
  }

  /**
   * ランク価格APIへ`POST`リクエストを送信。
   * @param file 一括登録するランク価格情報のCSVファイル。
   * @return レスポンスの`Observable`。
   */
  bulkAdd(file: Blob): Observable<PriceRankingApiResponse> {
    const formData = this.generateFormData({ file });
    return this.http
      .put<PriceRankingApiResponse>(this.endpoint, formData)
      .pipe(catchError(this.setErrorMessage('ランク価格情報の一括登録')));
  }

  /**
   * `ランク価格API/{ランク価格id}`へ`PATCH`リクエストを送信。
   * @param id 更新するランク価格のレコードID。
   * @param supplier 更新するランク価格情報を格納したオブジェクト。
   * @returns レスポンスの`Observable`。
   */
  update(id: number, priceRanking: any): Observable<PriceRankingApiResponse> {
    const formData = this.generateFormData(priceRanking);
    return this.http
      .patch<PriceRankingApiResponse>(`${this.endpoint}/${id}`, formData)
      .pipe(catchError(this.setErrorMessage('ランク価格情報の更新')));
  }

  /**
   * `ランク価格API/{ランク価格id}`へ`DELETE`リクエストを送信。
   * @param id 削除するランク価格のレコードID。
   * @returns レスポンスの`Observable`。
   */
  remove(id: number): Observable<PriceRankingApiResponse> {
    return this.http
      .delete<PriceRankingApiResponse>(`${this.endpoint}/${id}`)
      .pipe(catchError(this.setErrorMessage('価格ランク情報の削除')));
  }

  /**
   * ランク価格APIへGETリクエストを送信し、結果を{'ランク価格': SelectOption[]}の配列として返却する
   * @returns {'ランク価格': SelectOption[]}のObservable
   */
  geAsSelectOptions(): Observable<Record<string, SelectOption[]>> {
    return this.getAll().pipe(
      map((res) => {
        let ret = {} as Record<string, SelectOption[]>;
        let tempRankings!: PriceRanking[];
        let priceRankings: SelectOption[] = new Array();
        tempRankings = res.data;
        tempRankings
          .map(({ id, rank_division_id }) => ({
            value: id,
            text: String(rank_division_id), // 表示項目は暫定
          }))
          .map((x) => priceRankings.push(x));
        return (ret = { ランク価格: priceRankings });
      })
    );
  }
}
