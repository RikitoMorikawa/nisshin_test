import {
  Component,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { BasicInformation } from 'src/app/models/basic-information';
import { Employee, EmployeeApiResponse } from 'src/app/models/employee';
import { AuthorService } from 'src/app/services/author.service';
import { BasicInformationService } from 'src/app/services/basic-information.service';
import { headerMenu } from 'src/environments/environment';
/**
 * アイコンコンテナ
 * アイコン名、表示文字列、ルーティング用パスを保持
 */
type IconContainer = {
  icon: string;
  value: string;
  path: string;
};

@Component({
  selector: 'app-header-org',
  templateUrl: './header-org.component.html',
  styleUrls: ['./header-org.component.scss'],
})
export class HeaderOrgComponent implements OnInit, OnDestroy {
  /**
   * ログアウトボタンクリックイベント
   */
  @Output() logoutProcessFromHeaderOrg = new EventEmitter();

  /**
   * ログイン中ユーザー取得subscribeを終了させるストリーム
   */
  private subscription = new Subscription();

  /**
   * ログイン中ユーザー
   */
  author!: Employee;

  // 会社基本情報
  bi?: BasicInformation;

  /**
   * プロフィール・ログアウト内包パネルの開閉ステータス
   */
  protected isOpenedEmployeePanel = false;

  /**
   * コンストラクター
   * @param router
   * @param authorService
   */
  constructor(
    private router: Router,
    private authorService: AuthorService,
    private biService: BasicInformationService
  ) {}

  // グローバルナビ上部の固定しない部分のメニュー
  protected headerIcons: IconContainer[] = [
    { icon: 'account-box-line', value: '社員', path: '/employee' },
    { icon: 'settings-4-line', value: '設定', path: '/setting' },
  ];

  // グローバルナビのstickyメニュー
  protected navIcons: IconContainer[] = headerMenu;

  /**
   * Angular ライフサイクル
   * @returns void
   */
  ngOnInit(): void {
    if (this.biService.bi) {
      this.bi = this.biService.bi;
    } else {
      this.subscription.add(
        this.biService.bi$.subscribe((bi) => {
          this.bi = bi;
        })
      );
    }
    if (this.authorService.author) {
      this.author = this.authorService.author;
    } else {
      // 購読を一元管理
      this.subscription.add(
        // ログイン中ユーザーを取得
        this.authorService.author$.subscribe((author) => {
          this.author = author;
        })
      );
    }
  }

  /**
   * オリジナルタイプガード EmployeeAipResponse判定
   * @param arg
   * @returns boolean
   */
  isEmployeeAipResponse(arg: any): arg is EmployeeApiResponse {
    let result = false;
    result = arg.message !== undefined;
    result = arg.totalItems !== undefined;
    result = arg.data !== undefined;
    return result;
  }

  /**
   * routerLinkActiveを利用するために親コンポーネントにコンテンツがない場合リダイレクトさせる
   * @param path string
   */
  clickedHeaderIcon(path: string) {
    if (path === '/employee') {
      this.router.navigateByUrl('employee/list');
    }
  }

  /**
   * 社員ボタンクリック時のイベントハンドラー
   * @returns void
   */
  onClickEmployeeButton(): void {
    if (this.isOpenedEmployeePanel) {
      this.isOpenedEmployeePanel = false;
    } else {
      this.isOpenedEmployeePanel = true;
    }
  }

  /**
   * 社員パネル内プロフィール選択時のイベントハンドラー
   * @returns void
   */
  onSelectedProfile(): void {
    this.isOpenedEmployeePanel = false;
    this.router.navigateByUrl('/employee/detail/' + this.author.id);
  }

  /**
   * 社員パネル内ログアウト選択時のイベントハンドラー
   * @returns void
   */
  onSelectedLogout(): void {
    this.isOpenedEmployeePanel = false;
    this.logoutProcessFromHeaderOrg.emit();
  }

  /**
   * Angular ライフサイクル
   * @returns void
   */
  ngOnDestroy(): void {
    // 全ての購読を解除
    this.subscription.unsubscribe();
  }
}
