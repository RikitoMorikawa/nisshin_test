# 検索ボタン付きサジェストコンテナコンポーネントの利用方法

# SearchSuggestContainerComponent の使用方法（単一コントロール）

`SearchSuggestContainerComponent` ユーザーが検索ボックスにテキストを入力し検索ボタンをクリックすると、関連する選択肢を表示する Angular コンポーネントです。ユーザーが選択肢をクリックすると、選択されたオプションのデータがフォームコントロールにセットされます。

## 入力プロパティ

- `fc`: フォームコントロールをバインドします。
- `targetOptionData`: 選択肢を選択した際にフォームコントロールにセットするオプションのプロパティ名を指定します。'value'または'text'を指定できます。
- `nameAttrValue`: input 要素の name 属性の値を指定します。
- `idAttrValue`: input 要素の id 属性の値を指定します。
- `labelSize`: ラベルのサイズを指定します。
- `invalid`: true を設定すると入力が無効になります。
- `apiInput`: API から取得するデータに関する情報を指定します。

## 出力プロパティ

- `idValueChanges`: 選択されたアイテムの ID の変更を外部に送信するための Subject です。
- `selectedData`: 選択されたデータを外部に送信するための EventEmitter です。

## HTML テンプレート内での使用

単一のフォームコントロールをバインドして、`SearchSuggestContainerComponent`を使用します。

```html
<app-search-suggest-container
  nameAttrValue="rental_product_name"
  idAttrValue="rental-product-name"
  targetOptionData="text"
  [fc]="addFc.rental_product_name"
  [apiInput]="getAddFormProductNameSuggests()"
  (selectedData)="handleAddProductData($event)"
  [invalid]="
    formControlStateManager(addFc.rental_product_id)
  ">
  <div class="flex items-center gap-2">
    <span class="text-sm">商品名で検索</span>
  </div>
  <ng-container
    *ngTemplateOutlet="
      errors;
      context: { ctrl: addFc.rental_product_id }
    "
    message></ng-container>
</app-search-suggest-container>

<app-search-suggest-container
  nameAttrValue="rental_product_id"
  idAttrValue="rental-product-id"
  targetOptionData="value"
  [fc]="addFc.rental_product_id"
  [apiInput]="getAddFormProductIdSuggests()"
  (selectedData)="handleAddProductData($event)"
  [invalid]="
    formControlStateManager(addFc.rental_product_id)
  ">
  <div class="flex items-center gap-2">
    <span class="text-sm">商品IDで検索</span>
  </div>
  <ng-container
    *ngTemplateOutlet="
      errors;
      context: { ctrl: addFc.rental_product_id }
    "
    message></ng-container>
</app-search-suggest-container>
```

## 例: サービスとの連携

コンポーネントでサジェストを表示するために、API からデータを取得する必要があります。これは、Angular サービスを使用して行うことができます。以下は、サービスとコンポーネントを連携させる一例です。

### サービス

サービスでは、API からデータを取得するメソッドを定義します。

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  constructor(private http: HttpClient) {}

  getAll(queryParams: any): Observable<any> {
    return this.http.get<any>('api/products', { params: queryParams });
  }
}
```

### コンポーネント

コンポーネントで、サービスを使用してデータを取得し、apiInput にバインドするためのメソッドを定義します。
`SearchSuggestContainerComponent`で定義したインターフェイスをインポートする必要があります

```typescript
export interface ApiInput<T> {
  observable: Observable<T>;
  valueTargetColumn: string;
  textTargetColumn: string;
  textAttachColumn?: string;
}
```

```typescript
import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ProductService } from './product.service';
import { ApiInput } from 'src/app/components/molecules/search-suggest-container/search-suggest-container.component';

@Component({
  selector: 'app-product-search',
  template: `...`,
})
export class ProductSearchComponent {
  formControl = new FormControl();

  constructor(private productService: ProductService) {}

  getAddFormProductNameSuggests(): ApiInput<RentalProductApiResponse> {
    return {
      observable: this.productService.getAll({
        // 商品名で検索
        name: this.addFc.rental_product_name.value,
        // ステータスで絞り込む
        status_division_id: this.rentalProductStatusRentable.id,
        // 公開区分が公開中の商品に絞り込む
        data_permission_division_id: this.rentalProductDataPermissionPublish.id,
      }),
      // 選択肢のvalueとtextとして使用するテーブルの列名
      valueTargetColumn: 'id',
      textTargetColumn: 'name',
    };
  }

  getAddFormProductIdSuggests(): SearchSuggestApiInput<RentalProductApiResponse> {
    return {
      observable: this.productService.getAll({
        // 商品IDで検索
        id: this.addFc.rental_product_id.value,
        // ステータスで絞り込む
        status_division_id: this.rentalProductStatusRentable.id,
        // 公開区分が公開中の商品に絞り込む
        data_permission_division_id: this.rentalProductDataPermissionPublish.id,
      }),
      // 選択肢のvalueとtextとして使用するテーブルの列名
      valueTargetColumn: 'id',
      textTargetColumn: 'name',
    };
  }
}
```

## 注意点

- `SearchSuggestContainerComponent` の `fc` は必須プロパティであり、サジェスト検索の基となるフォームコントロールを指定する必要があります。
- `SearchSuggestContainerComponent` の `targetOptionData` は必須プロパティであり、選択結果のうち `valueTargetColumn` と `textTargetColumn` のどちらの値を表示するかを指定する必要があります。
- `apiInput` の `observable` は、API レスポンスを返すべきです。このオブザーバブルは、検索クエリパラメータとしてフォームコントロールの値を使用してデータを取得する必要があります。
- `apiInput` の `valueTargetColumn` と `textTargetColumn` は、サジェストで表示するデータの value と text のに指定するテーブルの列名を指定する必要があります。

## まとめ

`SearchSuggestContainerComponent` は、1 つの入力コントロールに基づいて検索ボタンクリックでサジェストを表示するためのコンポーネントです。サービスを使用して API からデータを取得し、そのデータをコンポーネントにバインドすることで、簡単にサジェスト機能を実装することができます。
