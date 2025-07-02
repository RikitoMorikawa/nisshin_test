import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map, Subscription } from 'rxjs';
import { CommonService } from 'src/app/services/shared/common.service';

/**
 * パンくずリストオブジェクトの型
 */
type BreadcrumbList = {
  path?: string;
  text: string;
};

@Component({
  selector: 'app-special-sale',
  templateUrl: './special-sale.component.html',
  styleUrls: ['./special-sale.component.scss'],
})
export class SpecialSaleComponent implements OnInit, OnDestroy {
  // 各種パラメータ
  // 購読を管理するための変数
  private subscription = new Subscription();
  breadcrumbList: BreadcrumbList[] = [];

  /**
   * コンストラクタ
   */
  constructor(private router: Router, private common: CommonService) {}

  // ローディング表示を管理
  isLoading = false;

  /**
   * コンポーネントの初期化処理
   */
  ngOnInit(): void {
    // ページ遷移イベントを購読
    this.subscription.add(
      this.router.events
        .pipe(
          filter((x) => x instanceof NavigationEnd),
          map((x) => x as NavigationEnd)
        )
        .subscribe(
          (x) => (this.breadcrumbList = this.createBreadcrumbList(x.url))
        )
    );

    // 初期状態のパンくずリストを設定
    this.breadcrumbList = this.createBreadcrumbList(this.router.url);

    // ローディング状況を購読
    this.subscription.add(
      this.common.loading$.subscribe((x) => {
        setTimeout(() => (this.isLoading = x));
      })
    );
  }

  /**
   * コンポーネントの終了処理
   */
  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  /**
   * URLに応じたパンくずリストオブジェクトを生成する。
   * @param url 表示されているページのURL。
   */
  private createBreadcrumbList(url: string) {
    const paths = url.replace(/.*\/special-sale\/?/, '').split('/');
    const breadcrumbList: BreadcrumbList[] = [
      { path: '/setting/menu', text: '設定一覧' },
      { path: './', text: '特売一覧' },
    ];
    switch (paths[0]) {
      case 'add':
        breadcrumbList.push({ text: '特売新規登録' });
        break;
      case 'bulk-add':
        breadcrumbList.push({ text: '特売一括登録' });
        break;
      case 'detail':
        breadcrumbList.push({ text: '特売詳細' });
        break;
      case 'edit':
        breadcrumbList.push(
          { path: `./detail/${paths[1]}`, text: '特売詳細' },
          { text: '特売編集' }
        );
        break;
      default:
        delete breadcrumbList[1].path;
    }
    return breadcrumbList;
  }
}
