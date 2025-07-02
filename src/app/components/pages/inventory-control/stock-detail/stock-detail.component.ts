import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, catchError, forkJoin, of, finalize } from 'rxjs';
import { Stock } from 'src/app/models/stock';
import { ModalService } from 'src/app/services/modal.service';
import { CommonService } from 'src/app/services/shared/common.service';
import { StockService } from 'src/app/services/stock.service';

type ListItem = {
  name: string;
  value?: string;
  prop_name?: keyof Stock;
};

@Component({
  selector: 'app-stock-detail',
  templateUrl: './stock-detail.component.html',
  styleUrls: ['./stock-detail.component.scss'],
})
export class StockDetailComponent implements OnInit {
  stock = {} as Stock;
  updater?: string;
  private stockId = this.route.snapshot.params['id'];

  // リスト要素で表示する項目の一覧とマッピング表
  readonly listItems: ListItem[] = [
    { name: '商品名', prop_name: 'product_name' },
    { name: '月次理論在庫', prop_name: 'quantity' },
    { name: '店舗名', prop_name: 'store_name' },
    { name: '集計日時', prop_name: 'created_at' },
  ];

  /**
   * コンストラクタ
   */
  constructor(
    private route: ActivatedRoute,
    private modal: ModalService,
    private stockService: StockService,
    private common: CommonService
  ) {}

  /**
   * コンポーネントの初期化処理
   */
  ngOnInit(): void {
    // ページ遷移時に表示範囲を最上段へ戻す
    window.scrollTo(0, 0);

    this.common.loading = true;
    // 在庫情報の Observable
    const stock$ = this.stockService.find(this.stockId).pipe(
      map((x) => x.data[0]),
      catchError(this.handleError<Stock>())
    );

    forkJoin({ stock$ })
      .pipe(finalize(() => (this.common.loading = false)))
      .subscribe((res) => {
        this.stock = res.stock$;
        this.setListItemsValue(res.stock$);
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
   * @param supplier 在庫オブジェクト。
   * @param customTags カスタムタグオブジェクトの配列。
   */
  private setListItemsValue(stock: Stock) {
    // Stock のプロパティそのままのものを格納
    this.listItems
      .filter((x) => x.prop_name)
      .forEach((item) => {
        item.value = (stock[item.prop_name!] ?? '') + '';
      });

    // 登録日時/登録者
    this.getListItem('集計日時')!.value = new Date(
      stock.created_at
    ).toLocaleString();
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
