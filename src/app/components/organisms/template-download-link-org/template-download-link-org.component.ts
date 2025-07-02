import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
} from '@angular/core';
import { Observable, take, tap, filter, finalize, switchMap } from 'rxjs';
import { download, generateBlobUrl } from 'src/app/functions/shared-functions';
import {
  ApiResponse,
  ExportStatus,
} from '../export-link-org/export-link-org.component';
import { ModalService } from 'src/app/services/modal.service';
import { createFileNameWithDate } from 'src/app/functions/shared-functions';

/**
 * 拡張したAPIレスポンスのインターフェイス。
 */
export interface ExtendedApiResponse extends ApiResponse {
  totalItems: string;
}

@Component({
  selector: 'app-template-download-link-org',
  templateUrl: './template-download-link-org.component.html',
  styleUrls: ['./template-download-link-org.component.scss'],
})
export class TemplateDownloadLinkOrgComponent implements OnDestroy {
  @Input() api$!: Observable<string>;
  @Input() fileNamePrefix!: string;
  @Input() templateFileExtension = 'csv';
  @Output() statusChange = new EventEmitter<ExportStatus>();

  constructor(private modal: ModalService) {}

  onClick() {
    const title = 'テンプレートのダウンロードを実行しますか？';

    // ファイル名を作成
    const fullFileName = createFileNameWithDate(
      this.fileNamePrefix + '一括登録テンプレート',
      this.templateFileExtension
    );

    // 実行確認モーダルを購読
    this.modal.closeEventObservable$
      .pipe(
        take(1), // 1回のみ実行
        filter(() => this.modal.getModalProperties().title === title), // 実行確認のモーダルじゃなければスルー
        filter((reseult) => reseult === 'continue'),
        tap(() => this.statusChange.emit(ExportStatus.START)),
        switchMap(() => this.api$), // APIコールへスイッチ
        tap(() => this.statusChange.emit(ExportStatus.FETCHED)),
        filter((x) => !!x), // 戻り値が空なら何もしない
        finalize(() => this.statusChange.emit(ExportStatus.END))
      )
      .subscribe((response) => {
        // JSONかどうか確認
        if (this.isJson(response)) {
          const responseJSON = JSON.parse(response);
          // 1000件以上か確認（念のため）
          if (Number(responseJSON.totalItems as ExtendedApiResponse) >= 1000) {
            this.modal.setModal(
              'テンプレートファイルが作成されました',
              '件数が多いため、ご登録のメールアドレスにダウンロードリンクが記載されたメールを送信しました。\n' +
                'メール本文のリンクをクリックして、ファイルをダウンロードしてください。\n' +
                '\n' +
                '※ メールが迷惑メールに振り分けられていることがあります。\n' +
                '※ メールが送信されるまで数分かかる場合があります。',
              'success',
              '閉じる',
              '閉じる',
              false
            );
          }
        } else {
          download(generateBlobUrl(response), fullFileName);
        }
      });

    this.modal.setModal(
      title,
      'ダウンロードを実行すると、件数に応じてCSVファイルがダウンロードされるか、ダウウンロードリンクが記載されたメールが送信されます\n' +
        '\n' +
        '※ ダウンロード処理に数分かかる場合があります。',
      'warning'
    );
  }

  /**
   * JSON形式かどうかをチェック
   * バックエンドの仕様：
   * ・件数が1000件未満だと文字列が返る（→ 直接DL）
   * ・件数が1000件以上だとJSONが返る（→ メールにダウウンロードリンク）
   * @param str
   * @returns
   */
  isJson(str: string) {
    try {
      JSON.parse(str);
      return true;
    } catch (error) {
      return false;
    }
  }

  // コンポーネントの終了処理
  ngOnDestroy(): void {
    // キャンセル扱いにしてモーダルを終了する
    this.modal.requestCloseModal('cancel');
  }
}
