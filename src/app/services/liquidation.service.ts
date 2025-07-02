import { Injectable } from '@angular/core';
import { protectedResources } from 'src/environments/environment';
import { catchError, Observable } from 'rxjs';
import { HttpService } from './shared/http.service';
import { LiquidationApiResponse } from 'src/app/models/liquidation';
import { HttpHeaders } from '@angular/common/http';

/**
 * 精算項目サービス
 */
@Injectable({
  providedIn: 'root',
})
export class LiquidationService extends HttpService {
  // 精算項目APIのエンドポイント
  readonly endpoint = protectedResources.liquidationApi.endpoint;

  /**
   * 精算項目APIへ`GET`リクエストを送信。
   * @param params 精算項目の絞り込みに使用するパラメータのオブジェクト。
   * @returns レスポンスの`Observable`。
   */
  getAll(params: object = {}): Observable<LiquidationApiResponse> {
    this.httpOptions.params = params;
    return this.http
      .get<LiquidationApiResponse>(this.endpoint, this.httpOptions)
      .pipe(catchError(this.setErrorMessage('精算項目一覧の取得')));
  }

  /**
   * `精算項目API/{精算項目id}`へ`GET`リクエストを送信。
   * @param id 取得する精算項目のレコードID。
   * @returns レスポンスの`Observable`。
   */
  find(id: number) {
    return this.http
      .get<LiquidationApiResponse>(`${this.endpoint}/${id}`)
      .pipe(catchError(this.setErrorMessage('精算項目情報の取得')));
  }

  /**
   * 精算項目APIへ`POST`リクエストを送信。
   * @param liquidation 登録する精算項目情報を格納したオブジェクト。
   * @return レスポンスの`Observable`。
   */
  add(liquidation: any): Observable<LiquidationApiResponse> {
    const formData = this.generateFormData(liquidation);
    return this.http
      .post<LiquidationApiResponse>(this.endpoint, formData)
      .pipe(catchError(this.setErrorMessage('精算項目情報の登録')));
  }

  /**
   * `精算項目API/{精算項目id}`へ`PATCH`リクエストを送信。
   * @param id 更新する精算項目のレコードID。
   * @param liquidation 更新する精算項目情報を格納したオブジェクト。
   * @returns レスポンスの`Observable`。
   */
  update(id: number, liquidation: any): Observable<LiquidationApiResponse> {
    const formData = this.generateFormData(liquidation);
    return this.http
      .patch<LiquidationApiResponse>(`${this.endpoint}/${id}`, formData)
      .pipe(catchError(this.setErrorMessage('精算項目情報の更新')));
  }

  /**
   * `精算項目API/{精算項目id}`へ`DELETE`リクエストを送信。
   * @param id 削除する精算項目のレコードID。
   * @returns レスポンスの`Observable`。
   */
  remove(id: number): Observable<LiquidationApiResponse> {
    return this.http
      .delete<LiquidationApiResponse>(`${this.endpoint}/${id}`)
      .pipe(catchError(this.setErrorMessage('精算項目情報の削除')));
  }
}
