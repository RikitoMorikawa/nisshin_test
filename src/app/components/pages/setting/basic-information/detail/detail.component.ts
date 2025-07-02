import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { catchError, of, Subscription } from 'rxjs';
import {
  BasicInformation,
  BasicInformationKeysForDisplay,
  BasicInformationLogicalNames,
} from 'src/app/models/basic-information';
import { BasicInformationService } from 'src/app/services/basic-information.service';
import { errorConst } from 'src/app/const/error.const';
import { ErrorService } from 'src/app/services/shared/error.service';
import { modalConst } from 'src/app/const/modal.const';
import { CommonService } from 'src/app/services/shared/common.service';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
})
export class DetailComponent implements OnInit, OnDestroy {
  /**
   * コンストラクター
   * @param basicInformationService
   */
  constructor(
    private basicInformationService: BasicInformationService,
    private errorService: ErrorService,
    private common: CommonService
  ) {}

  // 購読を一元管理
  subscription = new Subscription();

  // データ取得中フラグ
  isDuringAcquisition = false;

  // API取得した基本情報を格納
  basicInformation!: { [key: string]: string };

  // ループ用のキー
  displayKeys = BasicInformationKeysForDisplay;

  // 表示用論理名
  logicalNames = BasicInformationLogicalNames;

  /**
   * Angular ライフサイクルフック
   * @returns void
   */
  ngOnInit(): void {
    // ローディング開始
    this.isDuringAcquisition = true;
    this.common.loading = true;
    // 購読を格納
    this.subscription.add(
      // 基本情報を取得
      this.basicInformationService
        .find()
        .pipe(
          catchError((error: HttpErrorResponse) => {
            return of(error);
          })
        )
        .subscribe((res) => {
          // ローディング終了
          this.isDuringAcquisition = false;
          this.common.loading = false;
          if (res instanceof HttpErrorResponse) {
            // レスポンスがエラーの場合
            this.handleError(res.status, res.error.message);
          } else {
            // 安全に配列アクセスするためにdataの中身を確認
            if (
              res &&
              res.data &&
              Array.isArray(res.data) &&
              res.data.length > 0
            ) {
              const displayData = res.data[0];
              this.basicInformation =
                this.basicInformationDataGeneration(displayData);
            } else {
              this.handleError(400, errorConst.COULD_NOT_GET_DATA);
            }
          }
        })
    );
  }

  /**
   * APIで取得したデータを表示用にマッピング
   * @param basicInformation
   * @returns displayData { [key: string]: string }
   */
  basicInformationDataGeneration(basicInformation: BasicInformation): {
    [key: string]: string;
  } {
    const displayData = {
      corporate_num: basicInformation.corporate_num
        ? basicInformation.corporate_num
        : '未登録',
      created_at: new Date(basicInformation.created_at).toLocaleString(),
      created_id:
        basicInformation.employee_created_last_name +
        ' ' +
        basicInformation.employee_created_first_name,
      fax: basicInformation.fax ? basicInformation.fax : '未登録',
      invoice_number: basicInformation.invoice_number,
      locality: basicInformation.locality,
      logo_image_path: basicInformation.logo_image_path
        ? basicInformation.logo_image_path
        : '',
      mail: basicInformation.mail ? basicInformation.mail : '未登録',
      name: basicInformation.name ? basicInformation.name : '未登録',
      name_kana: basicInformation.name_kana
        ? basicInformation.name_kana
        : '未登録',
      other_address: basicInformation.other_address
        ? basicInformation.other_address
        : '未登録',
      // other_attribute: basicInformation.other_attribute ? basicInformation.other_attribute.toString() : '未登録', 利用しない
      payee_1: basicInformation.payee_1 ? basicInformation.payee_1 : '未登録',
      payee_2: basicInformation.payee_2 ? basicInformation.payee_2 : '未登録',
      postal_code: basicInformation.postal_code,
      province: basicInformation.province,
      representative_image_path: basicInformation.representative_image_path
        ? basicInformation.representative_image_path
        : '',
      representative_name: basicInformation.representative_name
        ? basicInformation.representative_name
        : '未登録',
      sales_fraction_division_id: basicInformation.division_sales_fraction_value
        ? basicInformation.division_sales_fraction_value
        : '未登録',
      sales_tax_fraction_division_id:
        basicInformation.division_sales_tax_fraction_value
          ? basicInformation.division_sales_tax_fraction_value
          : '未登録',
      street_address: basicInformation.street_address,
      tel: basicInformation.tel,
      updated_at: basicInformation.updated_at
        ? new Date(basicInformation.updated_at).toLocaleString()
        : '未登録',
      updated_id:
        basicInformation.employee_updated_last_name &&
        basicInformation.employee_updated_first_name
          ? basicInformation.employee_updated_last_name +
            ' ' +
            basicInformation.employee_updated_first_name
          : '未登録',
    };

    return displayData;
  }

  handleError(status: number, message: string) {
    // エラー対応
    // 親コンポーネントへエラー内容を送信
    this.errorService.setError({
      status: status,
      title: '基本情報詳細：' + modalConst.TITLE.HAS_ERROR,
      message: message,
      redirectPath: '/setting',
    });
  }

  /**
   * Angular ライフサイクルフック
   * @returns void
   */
  ngOnDestroy(): void {
    // 全ての購読を破棄
    this.subscription.unsubscribe();
  }
}
