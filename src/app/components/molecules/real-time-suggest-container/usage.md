# リアルタイムサジェストコンテナコンポーネントの利用方法

# RealTimeSuggestContainerComponent の使用方法（単一コントロール）

`RealTimeSuggestContainerComponent` はリアルタイムサジェストを表示するためのコンポーネントです。このセクションでは、単一のフォームコントロールを使用した場合の基本的な使用方法を説明します。

## コンポーネントのプロパティ

- `nameCtrl`: 必須。サジェスト検索の基になる FormControl を指定します。
- `apiInput`: 必須。API からデータを取得するためのオブザーバブル、および ID と名前、その他の 3 つのフィールド名が指定できます。ID と名前のフィールドは必須でその他のフィールドはオプションです。その他のフィールドがある場合は名前フィールドに半角スペースを入れて連結した文字列を返します。last_name で検索し、last_name first_name の連結した文字列が必要な場合などに利用できます。

```typescript
interface ApiInput<T> {
  observable: Observable<T>;
  idField: string;
  nameField: string;
  otherField?: string;
}
```

## HTML テンプレート内での使用

単一のフォームコントロールをバインドして、`RealTimeSuggestContainerComponent`を使用します。

```html
<app-real-time-suggest-container [nameCtrl]="nameFormControl" [apiInput]="getProductSuggests()"> </app-real-time-suggest-container>
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

```typescript
import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ProductService } from './product.service';

@Component({
  selector: 'app-product-search',
  template: `...`,
})
export class ProductSearchComponent {
  formControl = new FormControl();

  constructor(private productService: ProductService) {}

  getProductSuggests(): ApiInput<any> {
    return {
      observable: this.productService.getAll({
        name: this.formControl.value,
      }),
      idField: 'id',
      nameField: 'name',
    };
  }
}
```

## アウトプット

- `idValueChanges`: 選択されたアイテムの ID の変更を外部に送信するための Subject です。
- `selectedData`: 選択されたデータを外部に送信するための EventEmitter です。

これらのアウトプットは、親コンポーネントで受け取ることができ、選択されたデータに基づいて追加の処理を行うことができます。

```html
<app-real-time-suggest-container [nameCtrl]="nameFormControl" [apiInput]="getProductSuggests()" (idValueChanges)="onIdChange($event)" (selectedData)="onSelectedData($event)"> </app-real-time-suggest-container>
```

```typescript
onIdChange(id: string) {
  console.log('Selected ID:', id);
}

onSelectedData(data: any) {
  console.log('Selected Data:', data);
}
```

## 注意点

- `RealTimeSuggestContainerComponent` の `nameCtrl` は必須プロパティであり、サジェスト検索の基となるフォームコントロールを指定する必要があります。
- `apiInput` の `observable` は、API レスポンスを返すべきです。このオブザーバブルは、検索クエリパラメータとしてフォームコントロールの値を使用してデータを取得する必要があります。
- `apiInput` の `idField` と `nameField` は、サジェストで表示するデータの ID と名前のフィールド名を指定する必要があります。

## まとめ

`RealTimeSuggestContainerComponent` は、1 つまたは 2 つの入力コントロールに基づいてリアルタイムでサジェストを表示するための強力なコンポーネントです。サービスを使用して API からデータを取得し、そのデータをコンポーネントにバインドすることで、簡単にサジェスト機能を実装することができます。
