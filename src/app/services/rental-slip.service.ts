import { Injectable } from '@angular/core';
import { catchError, Observable, BehaviorSubject } from 'rxjs';
import { protectedResources } from 'src/environments/environment';
import { RentalSlip, RentalSlipApiResponse } from '../models/rental-slip';
import { HttpService } from './shared/http.service';

@Injectable({
  providedIn: 'root',
})
export class RentalSlipService extends HttpService {
  // APIのエンドポイント
  readonly endpoint = protectedResources.rentalSlipApi.endpoint;

  /**
   * APIへ`GET`リクエストを送信。
   * @param params 絞り込みに使用するパラメータのオブジェクト。
   * @returns レスポンスの`Observable`。
   */
  getAll(params = {}): Observable<RentalSlipApiResponse> {
    this.httpOptions.params = params;
    return this.http
      .get<RentalSlipApiResponse>(this.endpoint, this.httpOptions)
      .pipe(catchError(this.setErrorMessage('レンタル伝票一覧の取得')));
  }

  /**
   * `API/{id}`へ`GET`リクエストを送信。
   * @param id 取得するのレコードID。
   * @returns レスポンスの`Observable`。
   */
  find(id: number) {
    return this.http
      .get<RentalSlipApiResponse>(`${this.endpoint}/${id}`)
      .pipe(catchError(this.setErrorMessage('レンタル伝票情報の取得')));
  }

  /**
   * APIへ`POST`リクエストを送信。
   * @param data 登録する情報を格納したオブジェクト。
   * @return レスポンスの`Observable`。
   */
  add(data: any): Observable<RentalSlipApiResponse> {
    const formData = this.generateFormData(data);
    return this.http
      .post<RentalSlipApiResponse>(this.endpoint, formData)
      .pipe(catchError(this.setErrorMessage('レンタル伝票情報の登録')));
  }

  /**
   * `API/{id}`へ`PATCH`リクエストを送信。
   * @param id 更新するのレコードID。
   * @param rentalSlip 更新する情報を格納したオブジェクト。
   * @returns レスポンスの`Observable`。
   */
  update(id: number, rentalSlip: any): Observable<RentalSlipApiResponse> {
    const formData = this.generateFormData(rentalSlip);
    return this.http
      .patch<RentalSlipApiResponse>(`${this.endpoint}/${id}`, formData)
      .pipe(catchError(this.setErrorMessage('レンタル伝票情報の更新')));
  }

  /**
   * `API/{id}`へ`DELETE`リクエストを送信。
   * @param id 削除するのレコードID。
   * @returns レスポンスの`Observable`。
   */
  remove(id: number): Observable<RentalSlipApiResponse> {
    return this.http
      .delete<RentalSlipApiResponse>(`${this.endpoint}/${id}`)
      .pipe(catchError(this.setErrorMessage('レンタル伝票情報の削除')));
  }

  // BehaviorSubjectを使用して、初期値0を持つactionNumSubjectを作成します。
  // BehaviorSubjectは最新の値を保持し、購読者にその値を提供します。
  private actionNumSubject = new BehaviorSubject<number>(0);

  // actionNumSubjectをObservableとして公開します。
  // 他のコンポーネントやサービスがこのObservableを購読して値の変化を監視できます。
  actionNum$ = this.actionNumSubject.asObservable();

  // actionNumSubjectの値を更新するメソッドです。
  // nextメソッドを使用して新しい値を設定し、購読者に通知します。
  setActionNum(value: number) {
    this.actionNumSubject.next(value);
  }
}
