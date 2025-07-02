import { Injectable } from '@angular/core';
import { map, scan, Subject } from 'rxjs';
import { TableWithPaginationEvent } from 'src/app/components/molecules/table-with-pagination/table-with-pagination.component';
/**
 * 物理名と論理名のマッピングオブジェクトの型
 */
export type Mapping<T> = {
  name: keyof T;
  name_jp: string;
};

/**
 * APIレスポンスの型
 */
type ApiResponse<T> = {
  message: string;
  totalItems: number;
  data: T[];
};

/**
 * 共通サービス
 */
@Injectable({
  providedIn: 'root',
})
export class CommonService {
  // ローディング状態に関するパラメータ
  private subject = new Subject<boolean>();
  loading$ = this.subject.asObservable().pipe(
    map((x) => [x]),
    scan(this.tryResetAcc()),
    map((x) => !!x.length)
  );
  set loading(arg: boolean) {
    this.subject.next(arg);
  }

  /**
   * ストリームに流れる値を保持し、true と false の値が同数になった場合に
   * 保持している値をリセットする関数を返却する。
   * @returns `rxjs`の`scan`関数へ引き渡す関数。
   */
  private tryResetAcc() {
    return (acc: boolean[], value: boolean[]) => {
      const merged = acc.concat(value);
      return merged.filter((y) => y).length > merged.filter((y) => !y).length
        ? merged
        : [];
    };
  }

  /**
   * 絞り込み条件のオブジェクトを平坦化し、空欄の項目を取り除いたオブジェクトして返却する。
   * @param filter 変換対象となるオブジェクト。
   * @returns 平坦化し、空欄の項目が取り除かれたオブジェクト。
   */
  formatFormData<T>(filter: Partial<T>) {
    return this.removeNullsAndBlanks(this.flatting(filter));
  }

  /**
   * APIコール用のパラメータを生成する。
   * @param filter 絞り込み条件のオブジェクト。
   * @param pagination テーブルのページ状態オブジェクト。
   * @param mappings テーブルヘッダの、物理名と論理名のマッピングオブジェクト。
   * @returns APIコール用のパラメータとなるオブジェクト。
   */
  createApiParams<T>(
    filter: Partial<T>,
    pagination: TableWithPaginationEvent,
    mappings: Mapping<T>[]
  ) {
    // フィルタ条件を整形
    const formatted = this.formatFormData(filter);

    // ソート列の物理名を取得
    const column = mappings.find(
      (x) => x.name_jp === pagination.sort.column
    )?.name;

    // APIコール用のパラメータを生成して返却
    return {
      ...formatted,
      limit: pagination.itemsPerPage,
      offset: (pagination.page - 1) * pagination.itemsPerPage,
      sort: column ? `${String(column)}:${pagination.sort.order}` : '',
    };
  }

  /**
   * APIレスポンスからテーブルコンポーネントへ渡すオブジェクトを生成する。
   * @param res APIレスポンスのオブジェクト。
   * @param mappings APIの項目名とテーブルのヘッダ名のマッピングオブジェクト。
   * @param modFn APIレスポンスのレコードをテーブルボディへ格納する際の変換を行う関数。
   * @returns 生成された`TableWithPaginationParams`オブジェクト。
   */
  createTableParams<T>(
    res: ApiResponse<T>,
    mappings: Mapping<T>[],
    modFn?: (data: T) => (mapping: Mapping<T>) => any
  ) {
    // APIから取得した値を格納
    const header = mappings.map((x) => x.name_jp);
    const body = res.data.map((record) =>
      mappings.map(modFn ? modFn(record) : (x) => record[x.name])
    );
    // 生成した TableParams を返却
    return { total: res.totalItems, header, body };
  }
  /**
   * 入れ子になっているオブジェクトを平坦化して返却する。
   * ※ `FormGroup.value`で取れる値を平坦化する以外の利用は考慮してません。
   * @param obj 対象となるオブジェクト。
   * @returns 平坦化されたオブジェクト。
   */
  private flatting(obj: object) {
    const ret = {} as any;
    for (const [key, value] of Object.entries(obj)) {
      // プリミティブ型？
      if (
        value === null ||
        value instanceof Date ||
        typeof value !== 'object'
      ) {
        ret[key] = value;
        continue;
      }
      // 入れ子になってるオブジェクトなら再帰呼び出し
      for (const [cKey, cValue] of Object.entries(this.flatting(value))) {
        ret[`${cKey}_${key}`] = cValue;
      }
    }
    return ret as object;
  }

  /**
   * オブジェクトから`null`と空文字、未定義の項目を除外する処理。
   * 再帰的なチェックは行われません。
   * @param obj 対象となるオブジェクト（JSON）
   * @returns 空文字、`null`、`undefined`の項目が除外された`obj`
   */
  private removeNullsAndBlanks(obj: object) {
    const ret = {} as any;
    for (const [key, value] of Object.entries(obj)) {
      if (value !== null && value !== undefined && value !== '') {
        ret[key] = value;
      }
    }
    return ret as object;
  }
}
