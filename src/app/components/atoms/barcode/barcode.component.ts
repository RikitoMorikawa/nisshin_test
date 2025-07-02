import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import * as JsBarcode from 'jsbarcode';

@Component({
  selector: 'app-barcode',
  templateUrl: './barcode.component.html',
  styleUrls: ['./barcode.component.scss'],
})

/**
 * JsBarcodeはformatによって必須のプロパティが異なるため注意してください。
 * 公式サイト https://lindell.me/JsBarcode/
 */
export class BarcodeComponent implements OnInit, AfterViewInit {
  @Input() value!: string | number;
  @Input() elementId!: string;
  @Input() options?: JsBarcode.Options;

  constructor() {}

  ngOnInit(): void {
    // オプションが無ければデフォルト値を設定する
    if (
      this.options === null ||
      this.options === undefined ||
      Object.keys(this.options).length === 0
    ) {
      this.options = {
        width: 2,
        height: 50,
        format: 'CODE128',
        text: String(this.value),
        displayValue: true,
        fontOptions: 'bold',
        font: 'monospace',
        textAlign: 'center',
        textPosition: 'bottom',
        fontSize: 12,
        background: '#fff',
        lineColor: '#000',
        marginTop: 2,
        marginBottom: 2,
        marginLeft: 2,
        marginRight: 2,
      };
    }
  }

  ngAfterViewInit(): void {
    JsBarcode(`#${this.elementId}`, String(this.value), this.options);
  }
}
