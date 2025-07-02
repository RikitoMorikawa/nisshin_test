import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, catchError, forkJoin, of, finalize, Observable } from 'rxjs';
import { ApiResponse } from 'src/app/components/organisms/export-link-org/export-link-org.component';
import { LiquidationFn } from 'src/app/functions/liquidation-functions';
import {
  Liquidation,
  LiquidationApiResponse,
} from 'src/app/models/liquidation';
import { ModalService } from 'src/app/services/modal.service';
import { LiquidationService } from 'src/app/services/liquidation.service';

type ListItem = {
  name: string;
  value?: string;
  display: 'visible' | 'hidden' | 'editable';
  prop_name?: keyof Liquidation;
};

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
})
export class DetailComponent implements OnInit {
  loading = true;
  liquidation = {} as Liquidation;
  updater?: string;
  private liquidationId = this.route.snapshot.params['id'];
  removeMethod$: Observable<ApiResponse> = this.liquidationService
    .remove(this.liquidationId)
    .pipe(catchError(this.handleError<LiquidationApiResponse>()));

  // リスト要素で表示する項目の一覧とマッピング表
  readonly listItems: ListItem[] = [
    { name: '精算項目名', display: 'editable', prop_name: 'name' },
    { name: '略称', display: 'editable', prop_name: 'abbreviation_name' },
    { name: 'フィールド名', display: 'editable', prop_name: 'field_name' },
    {
      name: '表示区分',
      display: 'editable',
      prop_name: 'division_display_value',
    },
    {
      name: '精算区分',
      display: 'editable',
      prop_name: 'division_liquidation_value',
    },
    { name: '登録日時', display: 'hidden', prop_name: 'created_at' },
    { name: '登録者', display: 'hidden' },
    { name: '最終更新日時', display: 'hidden', prop_name: 'updated_at' },
    { name: '最終更新者', display: 'hidden' },
  ];

  /**
   * コンストラクタ
   */
  constructor(
    private route: ActivatedRoute,
    private modal: ModalService,
    private liquidationService: LiquidationService
  ) {}

  /**
   * コンポーネントの初期化処理
   */
  ngOnInit(): void {
    // ページ遷移時に表示範囲を最上段へ戻す
    window.scrollTo(0, 0);

    // 仕入先情報の Observable
    const liquidation$ = this.liquidationService.find(this.liquidationId).pipe(
      map((x) => x.data[0]),
      catchError(this.handleError<Liquidation>())
    );

    // 各 Observable を購読
    forkJoin({ liquidation$ })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((res) => {
        this.liquidation = res.liquidation$;
        this.updater = `${this.liquidation.employee_updated_last_name}　${this.liquidation.employee_updated_first_name}`;
        this.setListItemsValue(res.liquidation$);
      });
  }

  /**
   * ユーザーへエラーを通知するモーダルを表示し、アプリの動作を止めないよう空のオブジェクトを返却する。
   * @returns `catchError`関数へ渡す関数。
   */
  private handleError<T>() {
    return (err: HttpErrorResponse) => {
      console.error(err);
      this.modal.setModal(
        `通信エラー(${err.status})`,
        err.message,
        'danger',
        '閉じる',
        ''
      );
      return of({} as T);
    };
  }

  /**
   * リスト項目として表示する値を生成し、`this.listItems`の値を書き換える。
   * @param liquidation 仕入先オブジェクト。
   */
  private setListItemsValue(liquidation: Liquidation) {
    // Supplier のプロパティそのままのものを格納
    this.listItems
      .filter((x) => x.prop_name)
      .forEach((item) => {
        item.value = (liquidation[item.prop_name!] ?? '') + '';
      });

    // 登録日時/登録者
    this.getListItem('登録日時')!.value = new Date(
      liquidation.created_at
    ).toLocaleString();
    this.getListItem(
      '登録者'
    )!.value = `${liquidation.employee_created_last_name} ${liquidation.employee_created_first_name}`;

    // 最終更新日時/最終更新者
    if (liquidation.updated_at) {
      this.getListItem('最終更新日時')!.value = new Date(
        liquidation.updated_at
      ).toLocaleString();
      this.getListItem(
        '最終更新者'
      )!.value = `${liquidation.employee_updated_last_name} ${liquidation.employee_updated_first_name}`;
    }
  }

  /**
   * `this.listItems`から対象項目のオブジェクトを取得する。
   * @param name 取得対象の`ListItem.name`。
   * @returns ListItemオブジェクト。
   */
  private getListItem(name: string) {
    return this.listItems.find((x) => x.name === name);
  }
}
