import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription, filter, map } from 'rxjs';
import { CommonService } from 'src/app/services/shared/common.service';

/**
 * パンくずリストオブジェクトの型
 */
export type BreadcrumbList = {
  path?: string;
  text: string;
};

@Component({
  selector: 'app-client-working-field',
  templateUrl: './client-working-field.component.html',
  styleUrls: ['./client-working-field.component.scss'],
})
export class ClientWorkingFieldComponent implements OnInit, OnDestroy {
  private subscription?: Subscription;
  breadcrumbList: BreadcrumbList[] = [];
  isLoading = false;

  /**
   * コンストラクタ
   * @param router
   * @param modalService
   * @param errorService
   */
  constructor(private router: Router, private common: CommonService) {}

  /**
   * コンポーネントの初期化処理
   */
  ngOnInit(): void {
    // ローディング状況を購読
    this.subscription = this.common.loading$.subscribe((x) => {
      setTimeout(() => (this.isLoading = x));
    });
    // ページ遷移イベントを購読
    this.subscription = this.router.events
      .pipe(
        filter((x) => x instanceof NavigationEnd),
        map((x) => x as NavigationEnd)
      )
      .subscribe(
        (x) => (this.breadcrumbList = this.createBreadcrumbList(x.url))
      );
    // 初期状態のパンくずリストを設定
    this.breadcrumbList = this.createBreadcrumbList(this.router.url);
  }

  /**
   * URLに応じたパンくずリストオブジェクトを生成する
   * @param url
   * @returns 表示されているページのURL
   */
  createBreadcrumbList(url: string) {
    const paths = url.replace(/.*\/client-working-field\/?/, '').split('/');
    const breadcrumbList: BreadcrumbList[] = [
      { path: `/setting/menu`, text: '設定一覧' },
      { path: `./`, text: '得意先現場一覧' },
    ];
    switch (paths[0]) {
      case 'add':
        breadcrumbList.push({ text: '得意先現場新規登録' });
        break;
      case 'bulk-add':
        breadcrumbList.push({ text: '得意先現場一括登録' });
        break;
      case 'detail':
        breadcrumbList.push({ text: '得意先現場詳細' });
        break;
      case 'edit':
        breadcrumbList.push(
          { path: `./detail/${paths[1]}`, text: '得意先現場詳細' },
          { text: '得意先現場編集' }
        );
        break;
      default:
        delete breadcrumbList[1].path;
    }
    return breadcrumbList;
  }

  /**
   * コンポーネントの終了処理
   */
  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
