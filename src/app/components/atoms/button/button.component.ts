import { Component, Input } from '@angular/core';
import { __importDefault } from 'tslib';

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
})
export class ButtonComponent {
  // type="button"やtype="submit"などを想定
  @Input() btnType?: string = 'button';

  // button.component.scssにてTailwind.cssへ変換
  @Input() btnSize?: ButtonSize = 'md';

  // 文字色を指定
  @Input() btnTextColor?: string = 'text-black';

  // ホバー時の文字色を指定
  @Input() btnTextHoverColor?: string;

  // 枠線の色を指定
  @Input() btnLineColor?: string = 'border-gray-200';

  // ホバー時の枠線の色を指定
  @Input() btnLineHoverColor?: string = 'hover:border-gray-200';

  // 塗りの色を指定
  @Input() btnFillColor?: string = 'bg-white';

  // ホバー時の塗りの色を指定
  @Input() btnHoverColor?: string = 'hover:bg-iron-blue-100';

  // border-radiusを指定、デフォルトは4px（button.component.scssにて指定）
  @Input() btnRounded?: string = 'rounded-4';

  @Input() buttonDisabled?: boolean = false;

  constructor() {}
}
