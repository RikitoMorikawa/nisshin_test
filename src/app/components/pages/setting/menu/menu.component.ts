import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Employee } from 'src/app/models/employee';
import { AuthorService } from 'src/app/services/author.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit, OnDestroy {
  constructor(private authorService: AuthorService) {}

  // ログイン中ユーザー
  author!: Employee;

  // 購読をまとめてunsubscribeする
  subscription = new Subscription();

  // 画面に表示する設定項目
  settingItems = [
    { title: '01 特売', path: '/setting/special-sale', lock: true },
    { title: '02 店舗別売価', path: '/setting/store-price', lock: true },
    {
      title: '03 現金外内訳',
      path: '/setting/non-cash-item/credit',
      lock: true,
    },
    { title: '04 精算項目', path: '/setting/liquidation', lock: true },
    {
      title: '05 商品ブック第1分類',
      path: '/setting/product-book-first-category',
      lock: true,
    },
    {
      title: '06 商品ブック第2分類',
      path: '/setting/product-book-second-category',
      lock: true,
    },
    {
      title: '07 メイン商品ブック',
      path: '/setting/main-product-book',
      lock: true,
    },
    { title: '08 客層', path: '/setting/quality-customer', lock: true },
    {
      title: '09 得意先現場',
      path: '/setting/client-working-field',
      lock: true,
    },
    { title: '10 店舗', path: '/setting/store', lock: true },
    { title: '11 基本情報', path: '/setting/basic-information', lock: true },
    { title: '12 権限', path: '/setting/role', lock: true },
    { title: '13 区分', path: '/setting/division', lock: true },
    { title: '14 大分類', path: '/setting/large-category', lock: true },
    { title: '15 中分類', path: '/setting/medium-category', lock: true },
    { title: '16 小分類', path: '/setting/small-category', lock: true },
    {
      title: '17 カスタム大分類',
      path: '/setting/custom-large-category',
      lock: true,
    },
    {
      title: '18 カスタム中分類',
      path: '/setting/custom-medium-category',
      lock: true,
    },
    {
      title: '19 カスタム小分類',
      path: '/setting/custom-small-category',
      lock: true,
    },
    {
      title: '20 カスタムタグ',
      path: '/setting/custom-tag',
      lock: true,
    },
    {
      title: '21 ランク価格',
      path: '/setting/price-ranking',
      lock: true,
    },
    {
      title: '22 価格変更',
      path: '/setting/price-change',
      lock: true,
    },
    {
      title: '23 債権',
      path: '/setting/accounts-receivable-aggregate',
      lock: true,
    },
    {
      title: '24 債務',
      path: '/setting/accounts-payable-aggregate',
      lock: true,
    },
  ];

  /**
   * Angular ライフサイクルフック
   * @returns void
   */
  ngOnInit(): void {
    if (this.authorService.author) {
      this.author = this.authorService.author;
      if (this.author.role_name)
        this.generateSettingItems(this.author.role_name);
    } else {
      // 購読を一元管理
      this.subscription.add(
        this.authorService.author$.subscribe((author) => {
          this.author = author;
          if (this.author.role_name)
            this.generateSettingItems(this.author.role_name);
        })
      );
    }
  }

  /**
   * 社員の権限名で画面の項目のスタイルとリンクを設定
   * TODO: どの権限でどれができるのかニッシンさんへ確認の上修正
   * @param roleName 社員の権限名
   */
  generateSettingItems(roleName: string) {
    console.log(roleName);
    switch (roleName) {
      case 'admin':
        this.settingItems.forEach((item, index) => {
          this.settingItems[index].lock = false;
        });
        break;
      case '管理者':
        const trueItems = [
          '04 精算項目',
          '08 得意先現場',
          '09 店舗',
          '10 基本情報',
          '11 権限',
          '12 区分',
          '13 大分類',
          '14 中分類',
          '15 小分類',
          '16 カスタム大分類',
          '17 カスタム中分類',
          '18 カスタム小分類',
        ];
        this.settingItems.forEach((item, index) => {
          if (!trueItems.includes(item.title)) {
            this.settingItems[index] = {
              title: item.title,
              path: item.path,
              lock: false,
            };
          }
        });
        break;
      default:
        break;
    }
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
