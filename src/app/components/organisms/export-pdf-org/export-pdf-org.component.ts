import {
  Component,
  OnDestroy,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { Observable, take, filter, switchMap, tap } from 'rxjs';
import {
  download,
  generatePdfBlobUrl,
} from 'src/app/functions/shared-functions';
import { ModalService } from 'src/app/services/modal.service';

/**
 * エクスポート処理のステータスコード。
 */
export const ExportStatus = {
  START: 1,
  FETCHED: 3,
  END: 0,
} as const;

/**
 * ステータスコードの型
 */
export type ExportStatus = (typeof ExportStatus)[keyof typeof ExportStatus];

/**
 * エクスポートリンクコンポーネント
 */
@Component({
  selector: 'app-export-pdf-org',
  templateUrl: './export-pdf-org.component.html',
  styleUrls: ['./export-pdf-org.component.scss'],
})
export class ExportPdfOrgComponent implements OnDestroy {
  @Input() apiResponse$!: Observable<any>;
  @Input() filename?: string;
  @Input() modalMessage?: string;
  @Input() text = 'PDFダウンロード';
  @Output() statusChange = new EventEmitter<ExportStatus>();

  /**
   * コンストラクタ。
   */
  constructor(private modal: ModalService) {}

  message =
    'エクスポートを実行するとPDFファイルがダウンロードされます。\n' +
    '絞り込みを行っている場合は絞り込まれたデータがダウンロード対象になります。';
  /**
   * クリックに応じて一連の処理を実行する。
   */
  onClick() {
    const title = 'データエクスポートを実行しますか？';

    // モーダルの終了をサブスクライブ
    this.modal.closeEventObservable$
      .pipe(
        take(1),
        filter(() => this.modal.getModalProperties().title === title), // 実行確認のモーダルじゃなければスルー
        filter((result) => result === 'continue'),
        tap(() => this.statusChange.emit(ExportStatus.START)),
        switchMap(() => this.apiResponse$) // APIコールへスイッチ
      )
      .subscribe((response) => {
        this.statusChange.emit(ExportStatus.FETCHED);
        download(generatePdfBlobUrl(response), this.filename);
        this.statusChange.emit(ExportStatus.END);
      });

    // モーダルを表示する
    this.modal.setModal(
      title,
      this.modalMessage ? this.modalMessage : this.message,
      'warning'
    );
  }

  /**
   * コンポーネントの終了処理
   */
  ngOnDestroy(): void {
    // キャンセル扱いにしてモーダルを終了する
    this.modal.requestCloseModal('cancel');
  }
}
