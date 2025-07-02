import { Injectable } from '@angular/core';
import { catchError, Observable } from 'rxjs';
import { protectedResources } from 'src/environments/environment';
import { Rental, RentalApiResponse } from '../models/rental';
import { HttpService } from './shared/http.service';

@Injectable({
  providedIn: 'root',
})
export class RentalService extends HttpService {
  // エンドポイント
  readonly endpoint = protectedResources.rentalApi.endpoint;

  /**
   * APIへ GET リクエストを送信。
   * @param params 絞り込みに使用するパラメータのオブジェクト。
   * @returns レスポンスの Observable 。
   */
  getAll(params = {}): Observable<RentalApiResponse> {
    this.httpOptions.params = params;
    return this.http
      .get<RentalApiResponse>(this.endpoint, this.httpOptions)
      .pipe(catchError(this.setErrorMessage('レンタル一覧の取得')));
  }

  /**
   *  API/{id} へ GET リクエストを送信。
   * @param id 取得するレコードID。
   * @returns レスポンスの`Observable`。
   */
  find(id: number) {
    return this.http
      .get<RentalApiResponse>(`${this.endpoint}/${id}`)
      .pipe(catchError(this.setErrorMessage('レンタル個票の取得')));
  }

  /**
   * APIへ POST リクエストを送信。
   * @param data 登録する情報を格納したオブジェクト。
   * @return レスポンスの Observable 。
   */
  add(data: Partial<Rental>): Observable<RentalApiResponse> {
    const formData = this.generateFormData(data);
    return this.http
      .post<RentalApiResponse>(this.endpoint, formData)
      .pipe(catchError(this.setErrorMessage('レンタル個票の登録')));
  }

  /**
   * API/{id} へ PATCH リクエストを送信。
   * @param id 更新するのレコードID。
   * @param data 更新する情報を格納したオブジェクト。
   * @returns レスポンスの Observable。
   */
  update(id: number, data: Partial<Rental>): Observable<RentalApiResponse> {
    const formData = this.generateFormData(data);
    return this.http
      .patch<RentalApiResponse>(`${this.endpoint}/${id}`, formData)
      .pipe(catchError(this.setErrorMessage('レンタル個票の更新')));
  }

  /**
   *  API/{id} へ DELETE リクエストを送信。
   * @param id 削除するのレコードID。
   * @returns レスポンスの`Observable`。
   */
  remove(id: number): Observable<RentalApiResponse> {
    return this.http
      .delete<RentalApiResponse>(`${this.endpoint}/${id}`)
      .pipe(catchError(this.setErrorMessage('レンタル個票の削除')));
  }
}
