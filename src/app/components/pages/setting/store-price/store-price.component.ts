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
  selector: 'app-store-price',
  templateUrl: './store-price.component.html',
  styleUrls: ['./store-price.component.scss'],
})
export class StorePriceComponent implements OnInit, OnDestroy {
  // 各種パラメータ
  loading = false;
  private subscription = new Subscription();
  breadcrumbList: BreadcrumbList[] = [];

  /**
   * コンストラクタ
   */
  constructor(private common: CommonService, private router: Router) {}
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
    const paths = url.replace(/.*\/store-price\/?/, '').split('/');
    const breadcrumbList: BreadcrumbList[] = [
      { path: '/setting/menu', text: '設定一覧' },
      { path: './', text: '店舗売価一覧' },
    ];
    switch (paths[0]) {
      case 'add':
        breadcrumbList.push({ text: '店舗売価新規登録' });
        break;
      case 'bulk-add':
        breadcrumbList.push({ text: '店舗売価一括登録' });
        break;
      case 'detail':
        breadcrumbList.push({ text: '店舗売価詳細' });
        break;
      case 'edit':
        breadcrumbList.push(
          { path: `./detail/${paths[1]}`, text: '店舗売価詳細' },
          { text: '店舗売価編集' }
        );
        break;
      default:
        delete breadcrumbList[1].path;
    }
    return breadcrumbList;
  }
}
