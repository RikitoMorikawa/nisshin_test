// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

/**
 *
 * 本番環境のフラグ
 *
 */
export const environment = {
  production: true
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
/**
 * This file contains authentication parameters. Contents of this file
 * is roughly the same across other MSAL.js libraries. These parameters
 * are used to initialize Angular and MSAL Angular configurations in
 * in app.module.ts file.
 */


import { LogLevel, Configuration, BrowserCacheLocation } from '@azure/msal-browser';

/**
 *
 * IEかどうかのチェック
 *
 */
const isIE = window.navigator.userAgent.indexOf("MSIE ") > -1 || window.navigator.userAgent.indexOf("Trident/") > -1;

/**
 * Enter here the user flows and custom policies for your B2C application,
 * To learn more about user flows, visit https://docs.microsoft.com/en-us/azure/active-directory-b2c/user-flow-overview
 * To learn more about custom policies, visit https://docs.microsoft.com/en-us/azure/active-directory-b2c/custom-policy-overview
 */
export const b2cPolicies = {
  names: {
    signIn: "B2C_1_nisshin-signin",
  },
  authorities: {
    signIn: {
      authority: "https://devnisshin.b2clogin.com/devnisshin.onmicrosoft.com/B2C_1_nisshin-signin",
    }
  },
  authorityDomain: "devnisshin.b2clogin.com"
};

/**
 * Configuration object to be passed to MSAL instance on creation.
 * For a full list of MSAL.js configuration parameters, visit:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/configuration.md
 */
export const msalConfig: Configuration = {
  auth: {
    clientId: '167472e7-a5ad-4610-a4db-c587ac1bd398', // This is the ONLY mandatory field that you need to supply.
    authority: b2cPolicies.authorities.signIn.authority, // Defaults to "https://login.microsoftonline.com/common"
    knownAuthorities: [b2cPolicies.authorityDomain], // Mark your B2C tenant's domain as trusted.
    redirectUri: '/', // Points to window.location.origin. You must register this URI on Azure portal/App Registration.
    postLogoutRedirectUri: '/',
  },
  cache: {
    cacheLocation: BrowserCacheLocation.SessionStorage, // Configures cache location. "sessionStorage" is more secure, but "localStorage" gives you SSO between tabs.
    storeAuthStateInCookie: isIE, // Set this to "true" if you are having issues on IE11 or Edge
  },
  system: {
    loggerOptions: {
      loggerCallback(logLevel: LogLevel, message: string) {
        console.log(message);
      },
      logLevel: LogLevel.Verbose,
      piiLoggingEnabled: false
    }
  }
}

/**
 *
 * 認証不要のAPI
 *
 */
export const publicResources = {
}

/**
 * メニュー
 */
export const headerMenu = [
    { icon: 'home-3-line', value: 'ホーム', path: '/home' },
    { icon: 'server-line', value: 'マスタ', path: '/master' },
    { icon: 'money-cny-box-line', value: '売上', path: '/sales' },
    //{ icon: 'coupon-3-line', value: 'ポイント', path: '/point' },
    { icon: 'archive-line', value: '在庫', path: '/inventory-control' },
    { icon: 'mail-send-line', value: '発注', path: '/purchase-order' },
    {
      icon: 'service-line',
      value: '客注',
      path: '/customer-order-reception-slip',
    },
    { icon: 'truck-line', value: '配送', path: '/delivery' },
    { icon: 'group-line', value: '会員', path: '/member' },
];

/**
 * Add here the endpoints and scopes when obtaining an access token for protected web APIs. For more information, see:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/resources-and-scopes.md
 */
export const protectedResources = {
  basicInformationApi: {
    endpoint: "https://dev-nisshin-basic-information.azurewebsites.net/api/basic-information",
    scopes: [
      "https://devnisshin.onmicrosoft.com/f46baca3-2dce-4ba4-bec5-f7bb664bfb0f/Employee.All",
    ],
  },
  clientApi: {
    endpoint: "https://dev-nisshin-client.azurewebsites.net/api/client",
    scopes: [
      "https://devnisshin.onmicrosoft.com/f46baca3-2dce-4ba4-bec5-f7bb664bfb0f/Employee.All",
    ],
  },
  clientCustomTagApi: {
    endpoint: "https://dev-nisshin-client-custom-tag.azurewebsites.net/api/client-custom-tag",
    scopes: [
      "https://devnisshin.onmicrosoft.com/f46baca3-2dce-4ba4-bec5-f7bb664bfb0f/Employee.All",
    ],
  },
  divisionApi: {
    endpoint: "https://dev-nisshin-division.azurewebsites.net/api/division",
    scopes: [
      "https://devnisshin.onmicrosoft.com/f46baca3-2dce-4ba4-bec5-f7bb664bfb0f/Employee.All",
    ],
  },
  employeeApi: {
    endpoint: "https://dev-nisshin-employee.azurewebsites.net/api/employee",
    scopes: [
      "https://devnisshin.onmicrosoft.com/f46baca3-2dce-4ba4-bec5-f7bb664bfb0f/Employee.All"
    ],
  },
  priceRankingApi: {
    endpoint: "https://dev-nisshin-price-ranking.azurewebsites.net/api/price-ranking",
    scopes: [
      "https://devnisshin.onmicrosoft.com/f46baca3-2dce-4ba4-bec5-f7bb664bfb0f/Employee.All",
    ],
  },
  productApi: {
    endpoint: "https://dev-nisshin-product.azurewebsites.net/api/product",
    scopes: [
      "https://devnisshin.onmicrosoft.com/f46baca3-2dce-4ba4-bec5-f7bb664bfb0f/Employee.All",
    ],
  },
  productCustomTagApi: {
    endpoint: "https://dev-nisshin-product-custom-tag.azurewebsites.net/api/product-custom-tag",
    scopes: [
      "https://devnisshin.onmicrosoft.com/f46baca3-2dce-4ba4-bec5-f7bb664bfb0f/Employee.All",
    ],
  },
  purchaseApi: {
    endpoint: "https://dev-nisshin-purchase.azurewebsites.net/api/purchase",
    scopes: [
      "https://devnisshin.onmicrosoft.com/f46baca3-2dce-4ba4-bec5-f7bb664bfb0f/Employee.All",
    ],
  },
  purchaseDetailApi: {
    endpoint: "https://dev-nisshin-purchase-detail.azurewebsites.net/api/purchase-detail",
    scopes: [
      "https://devnisshin.onmicrosoft.com/f46baca3-2dce-4ba4-bec5-f7bb664bfb0f/Employee.All",
    ],
  },
  purchaseOrderApi: {
    endpoint: "https://dev-nisshin-purchase-order.azurewebsites.net/api/purchase-order",
    scopes: [
      "https://devnisshin.onmicrosoft.com/f46baca3-2dce-4ba4-bec5-f7bb664bfb0f/Employee.All",
    ],
  },
  purchaseOrderIssueReceptionSlipApi: {
    endpoint: "https://dev-nisshin-purchase-order.azurewebsites.net/api/issue-reception-slip",
    scopes: [
      "https://devnisshin.onmicrosoft.com/f46baca3-2dce-4ba4-bec5-f7bb664bfb0f/Employee.All",
    ],
  },
  roleApi: {
    endpoint: "https://dev-nisshin-role.azurewebsites.net/api/role",
    scopes: [
      "https://devnisshin.onmicrosoft.com/f46baca3-2dce-4ba4-bec5-f7bb664bfb0f/Employee.All",
    ],
  },
  storeApi: {
    endpoint: "https://dev-nisshin-store.azurewebsites.net/api/store",
    scopes: [
      "https://devnisshin.onmicrosoft.com/f46baca3-2dce-4ba4-bec5-f7bb664bfb0f/Employee.All",
    ],
  },
  supplierApi: {
    endpoint: "https://dev-nisshin-supplier.azurewebsites.net/api/supplier",
    scopes: [
      "https://devnisshin.onmicrosoft.com/f46baca3-2dce-4ba4-bec5-f7bb664bfb0f/Employee.All",
    ],
  },
  supplierCustomTagApi: {
    endpoint: "https://dev-nisshin-supplier-custom-tag.azurewebsites.net/api/supplier-custom-tag",
    scopes: [
      "https://devnisshin.onmicrosoft.com/f46baca3-2dce-4ba4-bec5-f7bb664bfb0f/Employee.All",
    ],
  },
  supplierProductApi: {
    endpoint: "https://dev-nisshin-supplier-product.azurewebsites.net/api/supplier-product",
    scopes: [
      "https://devnisshin.onmicrosoft.com/f46baca3-2dce-4ba4-bec5-f7bb664bfb0f/Employee.All",
    ],
  },
  largeCategoryApi: {
    endpoint: "https://dev-nisshin-large-category.azurewebsites.net/api/large-category",
    scopes: [
      "https://devnisshin.onmicrosoft.com/f46baca3-2dce-4ba4-bec5-f7bb664bfb0f/Employee.All",
    ],
  },
  mediumCategoryApi: {
    endpoint: "https://dev-nisshin-medium-category.azurewebsites.net/api/medium-category",
    scopes: [
      "https://devnisshin.onmicrosoft.com/f46baca3-2dce-4ba4-bec5-f7bb664bfb0f/Employee.All",
    ],
  },
  smallCategoryApi: {
    endpoint: "https://dev-nisshin-small-category.azurewebsites.net/api/small-category",
    scopes: [
      "https://devnisshin.onmicrosoft.com/f46baca3-2dce-4ba4-bec5-f7bb664bfb0f/Employee.All",
    ],
  },
  customLargeCategoryApi: {
    endpoint: "https://dev-nisshin-custom-large-category.azurewebsites.net/api/custom-large-category",
    scopes: [
      "https://devnisshin.onmicrosoft.com/f46baca3-2dce-4ba4-bec5-f7bb664bfb0f/Employee.All",
    ],
  },
  customMediumCategoryApi: {
    endpoint: "https://dev-nisshin-custom-medium-category.azurewebsites.net/api/custom-medium-category",
    scopes: [
      "https://devnisshin.onmicrosoft.com/f46baca3-2dce-4ba4-bec5-f7bb664bfb0f/Employee.All",
    ],
  },
  customSmallCategoryApi: {
    endpoint: "https://dev-nisshin-custom-small-category.azurewebsites.net/api/custom-small-category",
    scopes: [
      "https://devnisshin.onmicrosoft.com/f46baca3-2dce-4ba4-bec5-f7bb664bfb0f/Employee.All",
    ],
  },
  customTagApi: {
    endpoint: "https://dev-nisshin-custom-tag.azurewebsites.net/api/custom-tag",
    scopes: [
      "https://devnisshin.onmicrosoft.com/f46baca3-2dce-4ba4-bec5-f7bb664bfb0f/Employee.All",
    ],
  },
  liquidationApi: {
    endpoint: "https://dev-nisshin-liquidation.azurewebsites.net/api/liquidation",
    scopes: [
      "https://devnisshin.onmicrosoft.com/f46baca3-2dce-4ba4-bec5-f7bb664bfb0f/Employee.All",
    ],
  },
  nonCashItemCreditApi: {
    endpoint: "https://dev-nisshin-non-cash-item-credit.azurewebsites.net/api/non-cash-item-credit",
    scopes: [
      "https://devnisshin.onmicrosoft.com/f46baca3-2dce-4ba4-bec5-f7bb664bfb0f/Employee.All",
    ],
  },
  nonCashItemGiftApi: {
    endpoint: "https://dev-nisshin-non-cash-item-gift.azurewebsites.net/api/non-cash-item-gift",
    scopes: [
      "https://devnisshin.onmicrosoft.com/f46baca3-2dce-4ba4-bec5-f7bb664bfb0f/Employee.All",
    ],
  },
  nonCashItemLocalGiftApi: {
    endpoint: "https://dev-nisshin-non-cash-item-local-gift.azurewebsites.net/api/non-cash-item-local-gift",
    scopes: [
      "https://devnisshin.onmicrosoft.com/f46baca3-2dce-4ba4-bec5-f7bb664bfb0f/Employee.All",
    ],
  },
  productBookFirstCategoryApi: {
    endpoint: "https://dev-nisshin-product-book-first-category.azurewebsites.net/api/product-book-first-category",
    scopes: [
      "https://devnisshin.onmicrosoft.com/f46baca3-2dce-4ba4-bec5-f7bb664bfb0f/Employee.All",
    ],
  },
  productBookSecondCategoryApi: {
    endpoint: "https://dev-nisshin-product-book-second-category.azurewebsites.net/api/product-book-second-category",
    scopes: [
      "https://devnisshin.onmicrosoft.com/f46baca3-2dce-4ba4-bec5-f7bb664bfb0f/Employee.All",
    ],
  },
  productBookThirdCategoryApi: {
    endpoint: "https://dev-nisshin-product-book-third-category.azurewebsites.net/api/product-book-third-category",
    scopes: [
      "https://devnisshin.onmicrosoft.com/f46baca3-2dce-4ba4-bec5-f7bb664bfb0f/Employee.All",
    ],
  },
  orderApi: {
    endpoint: "https://dev-nisshin-order.azurewebsites.net/api/order",
    scopes: [
      "https://devnisshin.onmicrosoft.com/f46baca3-2dce-4ba4-bec5-f7bb664bfb0f/Employee.All",
    ],
  },
  inventoryApi: {
    endpoint: "https://dev-nisshin-inventory.azurewebsites.net/api/inventory",
    scopes: [
      "https://devnisshin.onmicrosoft.com/f46baca3-2dce-4ba4-bec5-f7bb664bfb0f/Employee.All",
    ],
  },
  inventoryGroupApi: {
    endpoint: "https://dev-nisshin-inventory.azurewebsites.net/api/group",
    scopes: [
      "https://devnisshin.onmicrosoft.com/f46baca3-2dce-4ba4-bec5-f7bb664bfb0f/Employee.All",
    ],
  },
  inventoryCompleteApi: {
    endpoint: "https://dev-nisshin-inventory.azurewebsites.net/api/complete",
    scopes: [
      "https://devnisshin.onmicrosoft.com/f46baca3-2dce-4ba4-bec5-f7bb664bfb0f/Employee.All",
    ],
  },
  inventoryNotInputApi: {
    endpoint: "https://dev-nisshin-inventory.azurewebsites.net/api/output-not-input",
    scopes: [
      "https://devnisshin.onmicrosoft.com/f46baca3-2dce-4ba4-bec5-f7bb664bfb0f/Employee.All",
    ],
  },
  salesSlipApi: {
    endpoint: "https://dev-nisshin-sales-slip.azurewebsites.net/api/sales-slip",
    scopes: [
      "https://devnisshin.onmicrosoft.com/f46baca3-2dce-4ba4-bec5-f7bb664bfb0f/Employee.All",
    ],
  },
  salesDetailApi: {
    endpoint: "https://dev-nisshin-sales-detail.azurewebsites.net/api/sales-detail",
    scopes: [
      "https://devnisshin.onmicrosoft.com/f46baca3-2dce-4ba4-bec5-f7bb664bfb0f/Employee.All",
    ],
  },
  stockApi: {
    endpoint: "https://dev-nisshin-stock.azurewebsites.net/api/stock",
    scopes: [
      "https://devnisshin.onmicrosoft.com/f46baca3-2dce-4ba4-bec5-f7bb664bfb0f/Employee.All",
    ],
  },
  qualityCustomerApi: {
    endpoint: "https://dev-nisshin-quality-customer.azurewebsites.net/api/quality-customer",
    scopes: [
      "https://devnisshin.onmicrosoft.com/f46baca3-2dce-4ba4-bec5-f7bb664bfb0f/Employee.All",
    ],
  },
  SpecialSaleApi: {
    endpoint: "https://dev-nisshin-special-sale.azurewebsites.net/api/special-sale",
    scopes: [
      "https://devnisshin.onmicrosoft.com/f46baca3-2dce-4ba4-bec5-f7bb664bfb0f/Employee.All",
    ],
  },
  priceChangeApi: {
    endpoint: "https://dev-nisshin-price-change.azurewebsites.net/api/price-change",
    scopes: [
      "https://devnisshin.onmicrosoft.com/f46baca3-2dce-4ba4-bec5-f7bb664bfb0f/Employee.All",
    ],
  },
  creditApi: {
    endpoint: "https://dev-nisshin-non-cash-item-credit.azurewebsites.net/api/non-cash-item-credit",
    scopes: [
      "https://devnisshin.onmicrosoft.com/f46baca3-2dce-4ba4-bec5-f7bb664bfb0f/Employee.All",
    ],
  },
  repairApi: {
    endpoint: "https://dev-nisshin-repair.azurewebsites.net/api/repair",
    scopes: [
      "https://devnisshin.onmicrosoft.com/f46baca3-2dce-4ba4-bec5-f7bb664bfb0f/Employee.All",
    ],
  },
  repairSlipApi: {
    endpoint: "https://dev-nisshin-repair-slip.azurewebsites.net/api/repair-slip",
    scopes: [
      "https://devnisshin.onmicrosoft.com/f46baca3-2dce-4ba4-bec5-f7bb664bfb0f/Employee.All",
    ],
  },
  gift1Api: {
    endpoint: "https://dev-nisshin-non-cash-item-gift1.azurewebsites.net/api/non-cash-item-gift1",
    scopes: [
      "https://devnisshin.onmicrosoft.com/f46baca3-2dce-4ba4-bec5-f7bb664bfb0f/Employee.All",
    ],
  },
  gift3Api: {
    endpoint: "https://dev-nisshin-non-cash-item-gift3.azurewebsites.net/api/non-cash-item-gift3",
    scopes: [
      "https://devnisshin.onmicrosoft.com/f46baca3-2dce-4ba4-bec5-f7bb664bfb0f/Employee.All",
    ],
  },
  gift2Api: {
    endpoint: "https://dev-nisshin-non-cash-item-gift2.azurewebsites.net/api/non-cash-item-gift2",
    scopes: [
      "https://devnisshin.onmicrosoft.com/f46baca3-2dce-4ba4-bec5-f7bb664bfb0f/Employee.All",
    ],
  },
  gift4Api: {
    endpoint: "https://dev-nisshin-non-cash-item-gift4.azurewebsites.net/api/non-cash-item-gift4",
    scopes: [
      "https://devnisshin.onmicrosoft.com/f46baca3-2dce-4ba4-bec5-f7bb664bfb0f/Employee.All",
    ],
  },
  qrApi: {
    endpoint: "https://dev-nisshin-non-cash-item-qr.azurewebsites.net/api/non-cash-item-qr",
    scopes: [
      "https://devnisshin.onmicrosoft.com/f46baca3-2dce-4ba4-bec5-f7bb664bfb0f/Employee.All",
    ],
  },
  memberApi: {
    endpoint: "https://dev-nisshin-member.azurewebsites.net/api/member",
    scopes: [
      "https://devnisshin.onmicrosoft.com/f46baca3-2dce-4ba4-bec5-f7bb664bfb0f/Employee.All",
    ],
  },
  deliveryApi: {
    endpoint: "https://dev-nisshin-delivery.azurewebsites.net/api/delivery",
    scopes: [
      "https://devnisshin.onmicrosoft.com/f46baca3-2dce-4ba4-bec5-f7bb664bfb0f/Employee.All",
    ],
  },
  customerOrderReceptionSlipApi: {
    endpoint: "https://dev-nisshin-customer-order-reception-slip.azurewebsites.net/api/customer-order-reception-slip",
    scopes: [
      "https://devnisshin.onmicrosoft.com/f46baca3-2dce-4ba4-bec5-f7bb664bfb0f/Employee.All",
    ],
  },
  customerOrderReceptionSlipIssueQuotationApi: {
    endpoint: "https://dev-nisshin-customer-order-reception-slip.azurewebsites.net/api/issue-reception-slip",
    scopes: [
      "https://devnisshin.onmicrosoft.com/f46baca3-2dce-4ba4-bec5-f7bb664bfb0f/Employee.All",
    ],
  },
  CustomerOrderApi: {
    endpoint: "https://dev-nisshin-customer-order.azurewebsites.net/api/customer-order",
    scopes: [
      "https://devnisshin.onmicrosoft.com/f46baca3-2dce-4ba4-bec5-f7bb664bfb0f/Employee.All",
    ],
  },
  StorePriceApi: {
    endpoint: "https://dev-nisshin-store-price.azurewebsites.net/api/store-price",
    scopes: [
      "https://devnisshin.onmicrosoft.com/f46baca3-2dce-4ba4-bec5-f7bb664bfb0f/Employee.All",
    ],
  },
  rentalApi: {
    endpoint: "https://dev-nisshin-rental.azurewebsites.net/api/rental",
    scopes: [
      "https://devnisshin.onmicrosoft.com/f46baca3-2dce-4ba4-bec5-f7bb664bfb0f/Employee.All",
    ],
  },
  rentalProductApi: {
    endpoint: "https://dev-nisshin-rental-product.azurewebsites.net/api/rental-product",
    scopes: [
      "https://devnisshin.onmicrosoft.com/f46baca3-2dce-4ba4-bec5-f7bb664bfb0f/Employee.All",
    ],
  },
  rentalSlipApi: {
    endpoint: "https://dev-nisshin-rental-slip.azurewebsites.net/api/rental-slip",
    scopes: [
      "https://devnisshin.onmicrosoft.com/f46baca3-2dce-4ba4-bec5-f7bb664bfb0f/Employee.All",
    ],
  },
  accountsReceivableAggregateApi: {
    endpoint: "https://dev-nisshin-accounts-receivable-aggregate.azurewebsites.net/api/accounts-receivable-aggregate",
    scopes: [
      "https://devnisshin.onmicrosoft.com/f46baca3-2dce-4ba4-bec5-f7bb664bfb0f/Employee.All",
    ],
  },
  clientWorkingFieldApi: {
    endpoint: "https://dev-nisshin-client-working-field.azurewebsites.net/api/client-working-field",
    scopes: [
      "https://devnisshin.onmicrosoft.com/f46baca3-2dce-4ba4-bec5-f7bb664bfb0f/Employee.All",
    ],
  },
  accountsPayableAggregateApi: {
    endpoint: "https://dev-nisshin-accounts-payable-aggregate.azurewebsites.net/api/accounts-payable-aggregate",
    scopes: [
      "https://devnisshin.onmicrosoft.com/f46baca3-2dce-4ba4-bec5-f7bb664bfb0f/Employee.All",
    ],
  },
}


/**
 * Scopes you add here will be prompted for user consent during sign-in.
 * By default, MSAL.js will add OIDC scopes (openid, profile, email) to any login request.
 * For more information about OIDC scopes, visit:
 * https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-permissions-and-consent#openid-connect-scopes
 */
export const loginRequest = {
  scopes: []
};
