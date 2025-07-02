import { Injectable } from '@angular/core';
import { HttpService } from './shared/http.service';
import { protectedResources } from 'src/environments/environment';
import { catchError, Observable } from 'rxjs';
import { IndividualBillApiResponse } from '../models/individual-bill';
/**
 * 個別請求書サービス
 */
@Injectable({
  providedIn: 'root',
})
export class IndividualBillService extends HttpService {
  // 個別請求書APIのエンドポイント
  readonly endpoint = protectedResources.billingDataCreationApi.endpoint;

  /**
   * `個別請求書API/`へ`PUT`リクエストを送信。
   * @param params 個別請求データの作成時の情報を格納したオブジェクト
   * @returns レスポンスの`Observable`。
   */
  createBillingData(
    createBillingData: any
  ): Observable<IndividualBillApiResponse> {
    const formData = this.generateFormData(createBillingData);
    return this.http
      .post<IndividualBillApiResponse>(this.endpoint, formData)
      .pipe(catchError(this.setErrorMessage('個別請求書情報の登録')));
  }
}
