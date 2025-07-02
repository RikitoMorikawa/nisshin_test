import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
} from '@angular/core';
import { filter, finalize, Observable, switchMap, take, tap } from 'rxjs';
import {
  ApiResponse,
  ExportStatus,
} from 'src/app/components/organisms/export-link-org/export-link-org.component';
import { download, generateBlobUrl } from 'src/app/functions/shared-functions';
import { ModalService } from 'src/app/services/modal.service';
import { createFileNameWithDate } from 'src/app/functions/shared-functions';

/**
 * 拡張したAPIレスポンスのインターフェイス。
 */
export interface ExtendedApiResponse extends ApiResponse {
  totalItems: string;
}

@Component({
  selector: 'app-export-link',
  templateUrl: './export-link.component.html',
  styleUrls: ['./export-link.component.scss'],
})
export class ExportLinkComponent implements OnDestroy {
  @Input() export$!: Observable<string>;
  @Input() fileNamePrefix!: string;
  @Input() exportFileExtension = 'csv';
  @Input() text = 'エクスポート';
  @Input() resBackSu = 1000;
  @Output() statusChange = new EventEmitter<ExportStatus>();

  /**
   * コンストラクタ
   */
  constructor(private modal: ModalService) {}

  /**
   * コンポーネントの終了処理
   */
  ngOnDestroy(): void {
    // キャンセル扱いにしてモーダルを終了する
    this.modal.requestCloseModal('cancel');
  }

  /**
   * クリックに応じて一連の処理を実行する。
   */
  onClick() {
    const title = 'データエクスポートを実行しますか？';
    // ファイル名を作成
    const fullFileName = createFileNameWithDate(
      this.fileNamePrefix,
      this.exportFileExtension
    );

    // モーダルの終了をサブスクライブ
    this.modal.closeEventObservable$
      .pipe(
        take(1),
        filter(() => this.modal.getModalProperties().title === title), // 実行確認のモーダルじゃなければスルー
        filter((result) => result === 'continue'),
        tap(() => this.statusChange.emit(ExportStatus.START)),
        switchMap(() => this.export$), // APIコールへスイッチ
        tap(() => this.statusChange.emit(ExportStatus.FETCHED)),
        filter((x) => !!x), // 戻り値が空なら何もしない
        finalize(() => this.statusChange.emit(ExportStatus.END))
      )
      .subscribe((response) => {
        // JSONかどうか確認
        if (this.isJson(response)) {
          const responseJSON = JSON.parse(response);
          // 1000件以上か確認（念のため）
          if (
            Number(responseJSON.totalItems as ExtendedApiResponse) >
            this.resBackSu
          ) {
            this.modal.setModal(
              'エクスポートファイルが作成されました',
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

    // モーダルを表示する
    this.modal.setModal(
      title,
      'エクスポートを実行するとCSVファイル形式のファイルがダウンロードされます。\n' +
        '絞り込みを行っている場合は絞り込まれたデータがエクスポート対象になります。\n' +
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
}
