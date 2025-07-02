import { Component, OnInit } from '@angular/core';
import { ProductService } from 'src/app/services/product.service';
import { ApiCallStatus } from '../../template/add-edit/add-edit.component';
import { ProductConst, productConst } from 'src/app/const/product.const';
import { CommonService } from 'src/app/services/shared/common.service';
import { AuthorService } from 'src/app/services/author.service';
import { Employee } from 'src/app/models/employee';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-bulk-add',
  templateUrl: './bulk-add.component.html',
  styleUrls: ['./bulk-add.component.scss'],
})
export class BulkAddComponent implements OnInit {
  // 商品用の定数
  productConst: ProductConst = productConst;
  fileNamePrefix = '商品';
  apiService = this.service;
  authorname: string = 'データ取得中...';

  descriptions = [
    {
      title: 'id',
      description: '商品ID（半角英数）※空欄にすると新規登録になります。',
    },
    {
      title: 'name',
      description: `商品名商品名（${productConst.CHARACTER_LIMITS.NAME_MAX_LENGTH}文字以内）`,
      required: true,
    },
    {
      title: 'name_kana',
      description: `商品名カナ（${productConst.CHARACTER_LIMITS.NAME_KANA_MAX_LENGTH}文字以内）`,
    },
    {
      title: 'supplier_id',
      description: '仕入先ID（半角数字）',
      required: true,
    },
    {
      title: 'supplier_product_cd',
      description: `仕入先商品コード（${productConst.CHARACTER_LIMITS.SUPPLIER_PRODUCT_CD}文字以内）`,
    },
    {
      title: 'standard',
      description: `規格（${productConst.CHARACTER_LIMITS.STANDARD_MAX_LENGTH}文字以内）`,
    },
    {
      title: 'part_number',
      description: `品番（${productConst.CHARACTER_LIMITS.PART_NUMBER_MAX_LENGTH}文字以内）`,
    },
    {
      title: 'basic_shipping_fee',
      description: '配送料金（半角数字）',
      required: true,
    },
    {
      title: 'shipping_surcharge',
      description: '配送追加料金（半角数字）',
      required: true,
    },
    {
      title: 'unit_division_id',
      description:
        '単位区分ID（191：個、192：本、193：着、194：台、195：枚、196：箱、197：袋、198：丁、199：足、200：巻、201：缶、202：P、203：M、204：双、205：ｾｯﾄ、206：組、207：ヶ、208：ST、209：束、210：ｶｰﾄﾝ、211：包、212：ﾊﾟｯｸ、213：打、214：反、215：kg、216：㎝、217：回、218：冊、219：式、220：KS、221：ｹｰｽ、222：ﾘｯﾄﾙ、223：杯、224：0、225：L、226：S、227：脚、228：紺、229：即、230：連）',
    },
    {
      title: 'b_unit_division_id',
      description:
        'B単位区分ID（191：個、192：本、193：着、194：台、195：枚、196：箱、197：袋、198：丁、199：足、200：巻、201：缶、202：P、203：M、204：双、205：ｾｯﾄ、206：組、207：ヶ、208：ST、209：束、210：ｶｰﾄﾝ、211：包、212：ﾊﾟｯｸ、213：打、214：反、215：kg、216：㎝、217：回、218：冊、219：式、220：KS、221：ｹｰｽ、222：ﾘｯﾄﾙ、223：杯、224：0、225：L、226：S、227：脚、228：紺、229：即、230：連）',
    },
    {
      title: 'c_unit_division_id',
      description:
        'C単位区分ID（191：個、192：本、193：着、194：台、195：枚、196：箱、197：袋、198：丁、199：足、200：巻、201：缶、202：P、203：M、204：双、205：ｾｯﾄ、206：組、207：ヶ、208：ST、209：束、210：ｶｰﾄﾝ、211：包、212：ﾊﾟｯｸ、213：打、214：反、215：kg、216：㎝、217：回、218：冊、219：式、220：KS、221：ｹｰｽ、222：ﾘｯﾄﾙ、223：杯、224：0、225：L、226：S、227：脚、228：紺、229：即、230：連）',
    },
    { title: 'b_quantity', description: 'B入数（半角数字）' },
    { title: 'c_quantity', description: 'C入数（半角数字）' },
    {
      title: 'barcode',
      description: `バーコード（${productConst.CHARACTER_LIMITS.BARCODE_MAX_LENGTH}文字以内）`,
      required: true,
    },
    {
      title: 'b_barcode',
      description: `Bバーコード（${productConst.CHARACTER_LIMITS.B_BARCODE_MAX_LENGTH}文字以内）`,
    },
    {
      title: 'c_barcode',
      description: `Cバーコード（${productConst.CHARACTER_LIMITS.C_BARCODE_MAX_LENGTH}文字以内）`,
    },
    {
      title: 'ordering_target_barcode',
      description: `発注対象バーコード（${productConst.CHARACTER_LIMITS.ORDERING_TARGET_BARCODE_MAX_LENGTH}文字以内）`,
      required: true,
    },
    { title: 'large_category_id', description: '大分類ID（半角数字）' },
    { title: 'medium_category_id', description: '中分類ID（半角数字）' },
    { title: 'small_category_id', description: '小分類ID（半角数字）' },
    {
      title: 'point_division_id',
      description:
        'ポイント区分ID（ポイント付与する: 38、ポイント付与しない: 39）',
      required: true,
    },
    {
      title: 'issuance_warranty_division_id',
      description: '保証書発行区分ID（発行しない: 40、発行する: 41）',
      required: true,
    },
    {
      title: 'discount_division_id',
      description: '値引区分（値引きする: 36、値引きしない: 37）',
      required: true,
    },
    {
      title: 'price_tag_division_id',
      description:
        'ポップシール区分ID（319：ラベルシール４４面、320：カトー１４Ｎ、321：名刺サイズ、322：棚番号付１００×４０、323：レーザー専用、324：Ａ４、325：Ａ５、326：Ａ６、328：なし）',
      required: true,
    },
    {
      title: 'seal_print_division_id',
      description: 'ラベルシール印刷区分ID（印刷する: 47、印刷しない: 48）',
      required: true,
    },
    {
      title: 'product_division_id',
      description: '商品区分ID（定番: 26、廃番: 27）',
    },
    {
      title: 'data_permission_division_id',
      description: 'データ公開区分（公開中: 52、仮保存: 53、非公開: 54）',
    },
    {
      title: 'sales_tax_division_id',
      description:
        '商品消費税区分ID（売上用）（外税10%: 28、内税10%: 29、非課税: 30、外税8%: 31、内税8%: 32）',
      required: true,
    },
    {
      title: 'sales_fraction_division_id',
      description:
        '商品販売端数区分ID（売上用）（切り捨て: 4、切り上げ: 5、四捨五入: 6）',
      required: true,
    },
    {
      title: 'supplier_sales_tax_division_id',
      description: '仕入先消費税区分ID（外税10%: 33、内税10%: 34、非課税: 35）',
      required: true,
    },
    {
      title: 'supplier_sales_fraction_division_id',
      description:
        '仕入先販売端数区分ID（切り捨て: 4、切り上げ: 5、四捨五入: 6）',
      required: true,
    },
    {
      title: 'supplier_cost_price',
      description: '仕入先商品単価（半角数字）',
      required: true,
    },
    {
      title: 'b_supplier_cost_price',
      description: '仕入先商品B単価（半角数字）',
    },
    {
      title: 'c_supplier_cost_price',
      description: '仕入先商品C単価（半角数字）',
      required: true,
    },
    {
      title: 'gross_profit_rate',
      description: '荒利率（半角数字）',
      required: true,
    },
    { title: 'b_gross_profit_rate', description: 'B荒利率（半角数字）' },
    {
      title: 'c_gross_profit_rate',
      description: 'C荒利率（半角数字）',
      required: true,
    },
    { title: 'selling_price', description: '売価（半角数字）', required: true },
    { title: 'b_selling_price', description: 'B売価（半角数字）' },
    {
      title: 'c_selling_price',
      description: 'C売価（半角数字）',
      required: true,
    },
    {
      title: 'minimum_order_quantity',
      description: '最小発注数（半角数字）',
    },
    { title: 'regulated_stock_num', description: '規定在庫数（半角数字）' },
    { title: 'ordering_point', description: '発注点（半角数字）' },
    { title: 'order_lead_time', description: '発注リードタイム（半角数字）' },
    {
      title: 'shelf_division_id',
      description:
        '陳列棚ID（0～82：231～312、86：313、99：314、383：315、393：316、737：317）',
      required: true,
    },
    {
      title: 'shelf_col_division_id',
      description: '陳列棚 - 列ID（0：318）',
      required: true,
    },
    {
      title: 'remarks_1',
      description: `備考1（${productConst.CHARACTER_LIMITS.REMARKS_1_MAX_LENGTH}文字以内）`,
    },
    {
      title: 'remarks_2',
      description: `備考2（${productConst.CHARACTER_LIMITS.REMARKS_2_MAX_LENGTH}文字以内）`,
    },
    {
      title: 'remarks_3',
      description: `備考3（レジ備考）（${productConst.CHARACTER_LIMITS.REMARKS_3_MAX_LENGTH}文字以内）`,
    },
    {
      title: 'remarks_4',
      description: `備考4（${productConst.CHARACTER_LIMITS.REMARKS_4_MAX_LENGTH}文字以内）`,
    },
    {
      title: 'custom_large_category_id',
      description: 'カスタム大分類ID（半角数字）',
    },
    {
      title: 'custom_medium_category_id',
      description: 'カスタム中分類ID（半角数字）',
    },
    {
      title: 'custom_small_category_id',
      description: 'カスタム小分類ID（半角数字）',
    },
    {
      title: 'seal_price_indication',
      description: 'ラベルシール価格表示区分（0: 表示しない、1:表示する）',
    },
    {
      title: 'custom_tag',
      description:
        'カスタムタグ（タグ名:値。2つ以上登録する場合は「タグ名:値@タグ名:値」のように@でつなぐ）',
    },
  ];

  /**
   * コンストラクタ
   */
  constructor(
    private common: CommonService,
    private service: ProductService,
    private authorService: AuthorService
  ) {}
  // ログイン中ユーザー
  author!: Employee;

  // 購読を一元管理
  private subscription = new Subscription();
  /**
   * Angular ライフサイクルフック
   * @returns void
   */
  // コンポーネントの初期化処理
  ngOnInit(): void {
    // ログイン中ユーザー取得
    if (this.authorService.author) {
      // サービスが保持していれば取得
      this.author = this.authorService.author;
      this.authorname = `${this.author.last_name} ${this.author.first_name}`;
    } else {
      // 購読を格納
      this.subscription.add(
        // ログイン中ユーザーストリームを購読
        this.authorService.author$.subscribe((author) => {
          this.author = author;
          this.authorname = `${this.author.last_name} ${this.author.first_name}`;
        })
      );
    }
  }

  /**
   * 編集テンプレのステータス変更に応じた処理
   * @param status 編集テンプレコンポーネントからの戻り値
   */
  listenStateChange(status: ApiCallStatus) {
    if (status === ApiCallStatus.START) {
      this.common.loading = true;
    }
    if (status === ApiCallStatus.END) {
      this.common.loading = false;
    }
  }
}
