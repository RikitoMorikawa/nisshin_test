import { Injectable } from '@angular/core';
import { protectedResources } from 'src/environments/environment';
import { catchError, Observable, Subject } from 'rxjs';
import { HttpService } from './shared/http.service';
import { Inventory, InventoryApiResponse } from 'src/app/models/inventory';
import { HttpHeaders } from '@angular/common/http';

/**
 * 棚卸サービス
 */
@Injectable({
  providedIn: 'root',
})
export class InventoryService extends HttpService {
  // 棚卸APIのエンドポイント
  readonly endpoint = protectedResources.inventoryApi.endpoint;

  // 棚卸グループAPIのエンドポイント
  readonly groupEndpoint = protectedResources.inventoryGroupApi.endpoint;

  // 棚卸完了APIのエンドポイント
  readonly completeEndpoint = protectedResources.inventoryCompleteApi.endpoint;

  // 棚卸未実施のデータ取得用エンドポイント
  readonly notInputEndpoint = protectedResources.inventoryNotInputApi.endpoint;

  // 棚卸未実施のデータ取得用エンドポイントと通常のエンドポイントを切り替えるための変数
  getAllEndpoint = this.endpoint;

  /**
   * 棚卸未実施の場合でエンドポイントを切り替える
   * @param notInputOnly 棚卸未実施のデータ取得用エンドポイントを使用するかどうかのフラグ
   */
  changeGetAllEndpoint(notInputOnly: boolean) {
    if (notInputOnly) {
      this.getAllEndpoint = this.notInputEndpoint;
    } else {
      this.getAllEndpoint = this.endpoint;
    }
  }

  /**
   * 棚卸APIへ`GET`リクエストを送信。
   * @param params 棚卸の絞り込みに使用するパラメータのオブジェクト。
   * @returns レスポンスの`Observable`。
   */
  getAll(params: object = {}): Observable<InventoryApiResponse> {
    this.httpOptions.params = params;
    return this.http
      .get<InventoryApiResponse>(this.getAllEndpoint, this.httpOptions)
      .pipe(catchError(this.setErrorMessage('棚卸一覧の取得')));
  }

  /**
   * 棚卸グループAPIへ`GET`リクエストを送信。
   * @param params
   * @returns
   */
  getGroupAll(params: object = {}): Observable<InventoryApiResponse> {
    this.httpOptions.params = params;
    return this.http
      .get<InventoryApiResponse>(this.groupEndpoint, this.httpOptions)
      .pipe(catchError(this.setErrorMessage('棚卸一覧の取得')));
  }

  /**
   * `棚卸API/{棚卸id}`へ`GET`リクエストを送信。
   * @param id 取得する棚卸のレコードID。
   * @returns レスポンスの`Observable`。
   */
  find(id: number) {
    return this.http
      .get<InventoryApiResponse>(`${this.endpoint}/${id}`)
      .pipe(catchError(this.setErrorMessage('棚卸情報の取得')));
  }

  /**
   * 棚卸APIへ`POST`リクエストを送信。
   * @param inventory 登録する棚卸情報を格納したオブジェクト。
   * @return レスポンスの`Observable`。
   */
  add(inventory: any): Observable<InventoryApiResponse> {
    const formData = this.generateFormData(inventory);
    return this.http
      .post<InventoryApiResponse>(this.endpoint, formData)
      .pipe(catchError(this.setErrorMessage('棚卸情報の登録')));
  }

  /**
   * 棚卸APIへ`POST`リクエストを送信。
   * @param file 一括登録する棚卸情報のCSVファイル。
   * @return レスポンスの`Observable`。
   */
  bulkAdd(file: Blob): Observable<InventoryApiResponse> {
    const formData = this.generateFormData({ file });
    return this.http
      .put<InventoryApiResponse>(this.endpoint, formData)
      .pipe(catchError(this.setErrorMessage('棚卸情報の一括登録')));
  }

  /**
   * ヘッダに`X-Download`のパラメータを指定して棚卸APIへ`GET`リクエストを送信。
   * @param type 取得するCSVテキストのタイプ。
   * @returns CSV形式のテキストを返す`Observable`。
   */
  getPdf(params: object = {}, type: 'pdf') {
    const options: object = {
      params: params,
      responseType: 'blob',
      headers: new HttpHeaders({ 'X-Download': type }),
    };
    return this.http
      .get<string>(this.notInputEndpoint, options)
      .pipe(catchError(this.setErrorMessage('棚卸表PDFファイルの取得')));
  }

  /**
   * `棚卸API/{棚卸id}`へ`PATCH`リクエストを送信。
   * @param id 更新する棚卸のレコードID。
   * @param inventory 更新する棚卸情報を格納したオブジェクト。
   * @returns レスポンスの`Observable`。
   */
  update(inventory: any): Observable<InventoryApiResponse> {
    const formData = this.generateFormData(inventory);
    return this.http
      .patch<InventoryApiResponse>(`${this.endpoint}`, formData)
      .pipe(catchError(this.setErrorMessage('棚卸情報の更新')));
  }

  /**
   * `棚卸API/{棚卸id}`へ`DELETE`リクエストを送信。
   * @param id 削除する棚卸のレコードID。
   * @returns レスポンスの`Observable`。
   */
  remove(id: number): Observable<InventoryApiResponse> {
    return this.http
      .delete<InventoryApiResponse>(`${this.endpoint}/${id}`)
      .pipe(catchError(this.setErrorMessage('棚卸情報の削除')));
  }

  /**
   * 棚卸完了APIへ`PATCH`リクエストを送信。
   * @param management_cd
   * @param store_id
   * @returns
   */
  complete(management_cd: string) {
    const formData = this.generateFormData({ management_cd });
    return this.http
      .patch<InventoryApiResponse>(this.completeEndpoint, formData)
      .pipe(catchError(this.setErrorMessage('棚卸完了情報の登録')));
  }

  // 実在庫登録用のイベントソース
  private _inventoryUpdateEventSource = new Subject<any>();
  // 実在庫登録用のイベントソースを公開する
  inventoryUpdateEvent$ = this._inventoryUpdateEventSource.asObservable();

  // 実在庫登録用のイベントソースを発火する
  sendInventoryUpdateEvent(data: any) {
    // 実在庫登録用のイベントソースにデータを流す
    this._inventoryUpdateEventSource.next(data);
  }
}
