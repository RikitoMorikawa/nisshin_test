# nisshin-web

ニッシン フロントエンド

## Require

  * Docker
    * https://www.docker.com

  * Angular 14.1.3

## Usage

ライブラリインストール（初回）
```shell
root@docker# cd /workspace/nisshin-web
root@docker# npm ci
```

### モジュール作成成
```shell
root@docker# ng g m components/atoms/button
```

### コンポーネント作成

```shell
root@docker# ng g c components/atoms/button
```

#### コマンド例

atoms作成
```shell
root@docker# ng g m components/atoms/button
root@docker# ng g c components/atoms/button --module components/atoms/button
```

molecules作成
```shell
root@docker# ng g m components/molecules/icon-container
root@docker# ng g c components/molecules/icon-container --module components/molecules/icon-container
```

organisms作成
```shell
root@docker# ng g m components/organisms/header-org
root@docker# ng g c components/organisms/header-org --module components/molecules/header-org
```

pages作成（遅延読み込み対象とする）
```shell
root@docker# ng g m components/pages/master --routing
root@docker# ng g c components/pages/master/product --module components/pages/master
```

### コンポーネントやサービス等が利用するライブラリとクラス名で被る場合

接頭辞として「app-」を付け加える

* src/app/functions/app-msal.ts

### Lazyload（遅延読み込み）

遅延させるルーティングモジュールを作成

```shell
root@docker# ng g module 遅延させるページ --routing
root@docker# ng g module components/lazy/my-page --routing
```

### ESLint（フォーマッター）

#### 使い方

```shell
root@docker# ng lint
```

### Prettier（フォーマッター）

#### インストール・設定

https://tech.quartetcom.co.jp/2022/04/19/angular-scaffold-packages/#prettier-%E3%82%92%E5%B0%8E%E5%85%A5%E3%81%99%E3%82%8B

#### 使い方

```shell
root@docker# npm run prettier -- --write ./src/app
```

### テスト

#### 使い方

##### テスト

Ctrl + Cで抜けます

```shell
root@docker# ng test
```

##### カバレッジレポート生成

```shell
root@docker# ng test --no-watch --code-coverage
```


```
.
├── README.md
├── angular.json
├── karma.conf.js
├── package-lock.json
├── package.json
├── src
│   ├── app
│   │   ├── app-routing.module.ts
│   │   ├── app.component.html
│   │   ├── app.component.scss
│   │   ├── app.component.spec.ts
│   │   ├── app.component.ts
│   │   ├── app.module.ts
│   │   ├── components
│   │   │   └── atoms・・・原子（Atomic Design）
│   │   │       └── button
│   │   │           ├── button.component.html
│   │   │           ├── button.component.scss
│   │   │           ├── button.component.spec.ts
│   │   │           └── button.component.ts
│   │   ├── functions
│   │   │   └── app-msal.ts
│   │   ├── home
│   │   │   ├── home.component.css
│   │   │   ├── home.component.html
│   │   │   └── home.component.ts
│   │   ├── models
│   │   │   ├── companies.ts
│   │   │   ├── items.ts
│   │   │   └── users.ts
│   │   ├── modules
│   │   │   └── shared
│   │   │       └── shared.module.ts ・・・コンポーネント共通読み込み
│   │   └── services
│   │       ├── company.service.ts
│   │       ├── item.service.ts
│   │       ├── shared
│   │       │   └── http.service.ts
│   │       └── user.service.ts
│   ├── assets
│   │   └── images
│   │       └── logo.jpg
│   ├── environments
│   │   ├── environment.prod.ts
│   │   └── environment.ts
│   ├── favicon.ico
│   ├── index.html
│   ├── main.ts
│   ├── polyfills.ts
│   ├── styles.scss
│   └── test.ts
├── tailwind.config.js
├── tsconfig.app.json
├── tsconfig.json
└── tsconfig.spec.json
```
# nisshin_test
