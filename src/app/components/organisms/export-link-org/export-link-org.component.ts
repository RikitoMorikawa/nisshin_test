import {
  Component,
  OnDestroy,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { Observable, take, filter, switchMap, tap } from 'rxjs';
import { download, generateBlobUrl } from 'src/app/functions/shared-functions';
import { ModalService } from 'src/app/services/modal.service';
import { createFileNameWithDate } from 'src/app/functions/shared-functions';

/**
 * APIレスポンスのインターフェイス。
 */
export interface ApiResponse {
  message: string;
  data: object[];
}

/**
 * CSVのヘッダ名とオブジェクトのプロパティ名との
 * マッピングを行うオブジェクトのインターフェイス。
 */
export interface CsvMapping {
  name: string;
  prop_name: string;
}

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
  selector: 'app-export-link-org',
  templateUrl: './export-link-org.component.html',
  styleUrls: ['./export-link-org.component.scss'],
})
export class ExportLinkOrgComponent implements OnDestroy {
  @Input() apiResponse$!: Observable<ApiResponse>;
  @Input() mappings!: CsvMapping[];
  @Input() fileNamePrefix!: string;
  @Input() exportFileExtension = 'csv';
  @Input() text = 'エクスポート';
  @Output() statusChange = new EventEmitter<ExportStatus>();

  /**
   * コンストラクタ。
   */
  constructor(private modal: ModalService) {}

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
        switchMap(() => this.apiResponse$) // APIコールへスイッチ
      )
      .subscribe((response) => {
        this.statusChange.emit(ExportStatus.FETCHED);
        const csv = this.convertCsv(response.data);
        download(generateBlobUrl(csv), fullFileName);
        this.statusChange.emit(ExportStatus.END);
      });

    // モーダルを表示する
    this.modal.setModal(
      title,
      'エクスポートを実行するとCSVファイル形式のファイルがダウンロードされます。\n' +
        '絞り込みを行っている場合は絞り込まれたデータがエクスポート対象になります。',
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

  /**
   * オブジェクトからCSV形式の文字列を生成する。入れ子になっているプロパティについては考慮しない。
   * @param json 変換対象のオブジェクト配列。
   * @returns CSV形式の文字列。
   */
  private convertCsv(json: object[]) {
    let ret = '';
    ret += this.mappings.map((x) => `"${x.name ?? ''}"`).join(',') + '\r\n';
    json.forEach((row) => {
      const value = this.mappings
        .map((x) => `"${row[x.prop_name as keyof object]}"`)
        .join(',');
      ret += value + '\r\n';
    });
    return ret;
  }
}
