import { Injectable } from '@angular/core';
import { map, scan, Subject } from 'rxjs';
import { FlashMessageService } from 'src/app/services/flash-message.service';

@Injectable()
export class SpecialSaleCommonService {
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
   * コンストラクタ
   */
  constructor(private flash: FlashMessageService) {}

  /**
   * 成功のフラッシュメッセージを表示する。
   * @param message 表示するメッセージ。
   */
  showSuccessMessage(message: string) {
    this.flash.setFlashMessage(message, 'success', 15000);
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
}
