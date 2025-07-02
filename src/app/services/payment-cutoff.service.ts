import { Injectable } from '@angular/core';
import { HttpService } from './shared/http.service';
import { protectedResources } from 'src/environments/environment';
import { catchError, Observable } from 'rxjs';
import { PaymentCutoffApiResponse } from '../models/payment-cutoff';
/**
 * 支払データ締めサービス
 */
@Injectable({
  providedIn: 'root',
})
export class PaymentCutoffService extends HttpService {
  // 支払締めAPIのエンドポイント
  readonly endpoint = protectedResources.paymentDataCreationApi.endpoint;

  /**
   * `支払締めAPI/`へ`PUT`リクエストを送信。
   * @param params 支払締めデータの作成時の情報を格納したオブジェクト
   * @returns レスポンスの`Observable`。
   */
  createPayableData(
    createPayableData: any
  ): Observable<PaymentCutoffApiResponse> {
    const formData = this.generateFormData(createPayableData);
    return this.http
      .post<PaymentCutoffApiResponse>(this.endpoint, formData)
      .pipe(catchError(this.setErrorMessage('支払締めデータの登録')));
  }
}
