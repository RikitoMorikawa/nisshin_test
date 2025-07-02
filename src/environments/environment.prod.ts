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
      authority: "https://nisshinrdk.b2clogin.com/nisshinrdk.onmicrosoft.com/B2C_1_nisshin-signin",
    }
  },
  authorityDomain: "nisshinrdk.b2clogin.com"
};

/**
 * Configuration object to be passed to MSAL instance on creation.
 * For a full list of MSAL.js configuration parameters, visit:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/configuration.md
 */
export const msalConfig: Configuration = {
  auth: {
    clientId: 'f4b9a1c1-3445-4a3a-a8d6-8e18defe91be', // This is the ONLY mandatory field that you need to supply.
    authority: b2cPolicies.authorities.signIn.authority, // Defaults to "https://login.microsoftonline.com/common"
    knownAuthorities: [b2cPolicies.authorityDomain], // Mark your B2C tenant's domain as trusted.
    redirectUri: '/', // Points to window.location.origin. You must register this URI on Azure portal/App Registration.
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
    { icon: 'store-2-line', value: 'レンタル', path: '/rental-slip' },
    { icon: 'tools-line', value: '修理', path: '/repair-slip' },
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
    endpoint: "https://nisshin-rdk-basic-information.azurewebsites.net/api/basic-information",
    scopes: [
      "https://nisshinrdk.onmicrosoft.com/a29ef36f-99f6-4c0d-ae42-ee5672bd47c7/Employee.All",
    ],
  },
  clientApi: {
    endpoint: "https://nisshin-rdk-client.azurewebsites.net/api/client",
    scopes: [
      "https://nisshinrdk.onmicrosoft.com/a29ef36f-99f6-4c0d-ae42-ee5672bd47c7/Employee.All",
    ],
  },
  clientCustomTagApi: {
    endpoint: "https://nisshin-rdk-client-custom-tag.azurewebsites.net/api/client-custom-tag",
    scopes: [
      "https://nisshinrdk.onmicrosoft.com/a29ef36f-99f6-4c0d-ae42-ee5672bd47c7/Employee.All",
    ],
  },
  divisionApi: {
    endpoint: "https://nisshin-rdk-division.azurewebsites.net/api/division",
    scopes: [
      "https://nisshinrdk.onmicrosoft.com/a29ef36f-99f6-4c0d-ae42-ee5672bd47c7/Employee.All",
    ],
  },
  employeeApi: {
    endpoint: "https://nisshin-rdk-employee.azurewebsites.net/api/employee",
    scopes: [
      "https://nisshinrdk.onmicrosoft.com/a29ef36f-99f6-4c0d-ae42-ee5672bd47c7/Employee.All",
    ],
  },
  priceRankingApi: {
    endpoint: "https://nisshin-rdk-price-ranking.azurewebsites.net/api/price-ranking",
    scopes: [
      "https://nisshinrdk.onmicrosoft.com/a29ef36f-99f6-4c0d-ae42-ee5672bd47c7/Employee.All",
    ],
  },
  productApi: {
    endpoint: "https://nisshin-rdk-product.azurewebsites.net/api/product",
    scopes: [
      "https://nisshinrdk.onmicrosoft.com/a29ef36f-99f6-4c0d-ae42-ee5672bd47c7/Employee.All",
    ],
  },
  productCustomTagApi: {
    endpoint: "https://nisshin-rdk-product-custom-tag.azurewebsites.net/api/product-custom-tag",
    scopes: [
      "https://nisshinrdk.onmicrosoft.com/a29ef36f-99f6-4c0d-ae42-ee5672bd47c7/Employee.All",
    ],
  },
  purchaseApi: {
    endpoint: "https://nisshin-rdk-purchase.azurewebsites.net/api/purchase",
    scopes: [
      "https://nisshinrdk.onmicrosoft.com/a29ef36f-99f6-4c0d-ae42-ee5672bd47c7/Employee.All",
    ],
  },
  purchaseDetailApi: {
    endpoint: "https://nisshin-rdk-purchase-detail.azurewebsites.net/api/purchase-detail",
    scopes: [
      "https://nisshinrdk.onmicrosoft.com/a29ef36f-99f6-4c0d-ae42-ee5672bd47c7/Employee.All",
    ],
  },
  purchaseOrderApi: {
    endpoint: "https://nisshin-rdk-purchase-order.azurewebsites.net/api/purchase-order",
    scopes: [
      "https://nisshinrdk.onmicrosoft.com/a29ef36f-99f6-4c0d-ae42-ee5672bd47c7/Employee.All",
    ],
  },
  purchaseOrderIssueReceptionSlipApi: {
    endpoint: "https://nisshin-rdk-purchase-order.azurewebsites.net/api/issue-reception-slip",
    scopes: [
      "https://nisshinrdk.onmicrosoft.com/a29ef36f-99f6-4c0d-ae42-ee5672bd47c7/Employee.All",
    ],
  },
  roleApi: {
    endpoint: "https://nisshin-rdk-role.azurewebsites.net/api/role",
    scopes: [
      "https://nisshinrdk.onmicrosoft.com/a29ef36f-99f6-4c0d-ae42-ee5672bd47c7/Employee.All",
    ],
  },
  storeApi: {
    endpoint: "https://nisshin-rdk-store.azurewebsites.net/api/store",
    scopes: [
      "https://nisshinrdk.onmicrosoft.com/a29ef36f-99f6-4c0d-ae42-ee5672bd47c7/Employee.All",
    ],
  },
  supplierApi: {
    endpoint: "https://nisshin-rdk-supplier.azurewebsites.net/api/supplier",
    scopes: [
      "https://nisshinrdk.onmicrosoft.com/a29ef36f-99f6-4c0d-ae42-ee5672bd47c7/Employee.All",
    ],
  },
  supplierCustomTagApi: {
    endpoint: "https://nisshin-rdk-supplier-custom-tag.azurewebsites.net/api/supplier-custom-tag",
    scopes: [
      "https://nisshinrdk.onmicrosoft.com/a29ef36f-99f6-4c0d-ae42-ee5672bd47c7/Employee.All",
    ],
  },
  supplierProductApi: {
    endpoint: "https://nisshin-rdk-supplier-product.azurewebsites.net/api/supplier-product",
    scopes: [
      "https://nisshinrdk.onmicrosoft.com/a29ef36f-99f6-4c0d-ae42-ee5672bd47c7/Employee.All",
    ],
  },
  largeCategoryApi: {
    endpoint: "https://nisshin-rdk-large-category.azurewebsites.net/api/large-category",
    scopes: [
      "https://nisshinrdk.onmicrosoft.com/a29ef36f-99f6-4c0d-ae42-ee5672bd47c7/Employee.All",
    ],
  },
  mediumCategoryApi: {
    endpoint: "https://nisshin-rdk-medium-category.azurewebsites.net/api/medium-category",
    scopes: [
      "https://nisshinrdk.onmicrosoft.com/a29ef36f-99f6-4c0d-ae42-ee5672bd47c7/Employee.All",
    ],
  },
  smallCategoryApi: {
    endpoint: "https://nisshin-rdk-small-category.azurewebsites.net/api/small-category",
    scopes: [
      "https://nisshinrdk.onmicrosoft.com/a29ef36f-99f6-4c0d-ae42-ee5672bd47c7/Employee.All",
    ],
  },
  customLargeCategoryApi: {
    endpoint: "https://nisshin-rdk-custom-large-category.azurewebsites.net/api/custom-large-category",
    scopes: [
      "https://nisshinrdk.onmicrosoft.com/a29ef36f-99f6-4c0d-ae42-ee5672bd47c7/Employee.All",
    ],
  },
  customMediumCategoryApi: {
    endpoint: "https://nisshin-rdk-custom-medium-category.azurewebsites.net/api/custom-medium-category",
    scopes: [
      "https://nisshinrdk.onmicrosoft.com/a29ef36f-99f6-4c0d-ae42-ee5672bd47c7/Employee.All",
    ],
  },
  customSmallCategoryApi: {
    endpoint: "https://nisshin-rdk-custom-small-category.azurewebsites.net/api/custom-small-category",
    scopes: [
      "https://nisshinrdk.onmicrosoft.com/a29ef36f-99f6-4c0d-ae42-ee5672bd47c7/Employee.All",
    ],
  },
  customTagApi: {
    endpoint: "https://nisshin-rdk-custom-tag.azurewebsites.net/api/custom-tag",
    scopes: [
      "https://nisshinrdk.onmicrosoft.com/a29ef36f-99f6-4c0d-ae42-ee5672bd47c7/Employee.All",
    ],
  },
  liquidationApi: {
    endpoint: "https://nisshin-rdk-liquidation.azurewebsites.net/api/liquidation",
    scopes: [
      "https://nisshinrdk.onmicrosoft.com/a29ef36f-99f6-4c0d-ae42-ee5672bd47c7/Employee.All",
    ],
  },
  nonCashItemCreditApi: {
    endpoint: "https://nisshin-rdk-non-cash-item-credit.azurewebsites.net/api/non-cash-item-credit",
    scopes: [
      "https://nisshinrdk.onmicrosoft.com/a29ef36f-99f6-4c0d-ae42-ee5672bd47c7/Employee.All",
    ],
  },
  nonCashItemGiftApi: {
    endpoint: "https://nisshin-rdk-non-cash-item-gift.azurewebsites.net/api/non-cash-item-gift",
    scopes: [
      "https://nisshinrdk.onmicrosoft.com/a29ef36f-99f6-4c0d-ae42-ee5672bd47c7/Employee.All",
    ],
  },
  nonCashItemLocalGiftApi: {
    endpoint: "https://nisshin-rdk-non-cash-item-local-gift.azurewebsites.net/api/non-cash-item-local-gift",
    scopes: [
      "https://nisshinrdk.onmicrosoft.com/a29ef36f-99f6-4c0d-ae42-ee5672bd47c7/Employee.All",
    ],
  },
  productBookFirstCategoryApi: {
    endpoint: "https://nisshin-rdk-product-book-first-category.azurewebsites.net/api/product-book-first-category",
    scopes: [
      "https://nisshinrdk.onmicrosoft.com/a29ef36f-99f6-4c0d-ae42-ee5672bd47c7/Employee.All",
    ],
  },
  productBookSecondCategoryApi: {
    endpoint: "https://nisshin-rdk-product-book-second-category.azurewebsites.net/api/product-book-second-category",
    scopes: [
      "https://nisshinrdk.onmicrosoft.com/a29ef36f-99f6-4c0d-ae42-ee5672bd47c7/Employee.All",
    ],
  },
  productBookThirdCategoryApi: {
    endpoint: "https://nisshin-rdk-product-book-third-category.azurewebsites.net/api/product-book-third-category",
    scopes: [
      "https://nisshinrdk.onmicrosoft.com/a29ef36f-99f6-4c0d-ae42-ee5672bd47c7/Employee.All",
    ],
  },
  orderApi: {
    endpoint: "https://nisshin-rdk-order.azurewebsites.net/api/order",
    scopes: [
      "https://nisshinrdk.onmicrosoft.com/a29ef36f-99f6-4c0d-ae42-ee5672bd47c7/Employee.All",
    ],
  },
  inventoryApi: {
    endpoint: "https://nisshin-rdk-inventory.azurewebsites.net/api/inventory",
    scopes: [
      "https://nisshinrdk.onmicrosoft.com/a29ef36f-99f6-4c0d-ae42-ee5672bd47c7/Employee.All",
    ],
  },
  inventoryGroupApi: {
    endpoint: "https://nisshin-rdk-inventory.azurewebsites.net/api/group",
    scopes: [
      "https://nisshinrdk.onmicrosoft.com/a29ef36f-99f6-4c0d-ae42-ee5672bd47c7/Employee.All",
    ],
  },
  inventoryCompleteApi: {
    endpoint: "https://nisshin-rdk-inventory.azurewebsites.net/api/complete",
    scopes: [
      "https://nisshinrdk.onmicrosoft.com/a29ef36f-99f6-4c0d-ae42-ee5672bd47c7/Employee.All",
    ],
  },
  inventoryNotInputApi: {
    endpoint: "https://nisshin-rdk-inventory.azurewebsites.net/api/output-not-input",
    scopes: [
      "https://nisshinrdk.onmicrosoft.com/a29ef36f-99f6-4c0d-ae42-ee5672bd47c7/Employee.All",
    ],
  },
  salesSlipApi: {
    endpoint: "https://nisshin-rdk-sales-slip.azurewebsites.net/api/sales-slip",
    scopes: [
      "https://nisshinrdk.onmicrosoft.com/a29ef36f-99f6-4c0d-ae42-ee5672bd47c7/Employee.All",
    ],
  },
  salesDetailApi: {
    endpoint: "https://nisshin-rdk-sales-detail.azurewebsites.net/api/sales-detail",
    scopes: [
      "https://nisshinrdk.onmicrosoft.com/a29ef36f-99f6-4c0d-ae42-ee5672bd47c7/Employee.All",
    ],
  },
  stockApi: {
    endpoint: "https://nisshin-rdk-stock.azurewebsites.net/api/stock",
    scopes: [
      "https://nisshinrdk.onmicrosoft.com/a29ef36f-99f6-4c0d-ae42-ee5672bd47c7/Employee.All",
    ],
  },
  stockTransferApi: {
    endpoint: "https://nisshin-rdk-stock-transfer.azurewebsites.net/api/stock-transfer",
    scopes: [
      "https://nisshinrdk.onmicrosoft.com/a29ef36f-99f6-4c0d-ae42-ee5672bd47c7/Employee.All",
    ],
  },
  qualityCustomerApi: {
    endpoint: "https://nisshin-rdk-quality-customer.azurewebsites.net/api/quality-customer",
    scopes: [
      "https://nisshinrdk.onmicrosoft.com/a29ef36f-99f6-4c0d-ae42-ee5672bd47c7/Employee.All",
    ],
  },
  SpecialSaleApi: {
    endpoint: "https://nisshin-rdk-special-sale.azurewebsites.net/api/special-sale",
    scopes: [
      "https://nisshinrdk.onmicrosoft.com/a29ef36f-99f6-4c0d-ae42-ee5672bd47c7/Employee.All",
    ],
  },
  priceChangeApi: {
    endpoint: "https://nisshin-rdk-price-change.azurewebsites.net/api/price-change",
    scopes: [
      "https://nisshinrdk.onmicrosoft.com/a29ef36f-99f6-4c0d-ae42-ee5672bd47c7/Employee.All",
    ],
  },
  creditApi: {
    endpoint: "https://nisshin-rdk-non-cash-item-credit.azurewebsites.net/api/non-cash-item-credit",
    scopes: [
      "https://nisshinrdk.onmicrosoft.com/a29ef36f-99f6-4c0d-ae42-ee5672bd47c7/Employee.All",
    ],
  },
  repairApi: {
    endpoint: "https://nisshin-rdk-repair.azurewebsites.net/api/repair",
    scopes: [
      "https://nisshinrdk.onmicrosoft.com/a29ef36f-99f6-4c0d-ae42-ee5672bd47c7/Employee.All",
    ],
  },
  repairSlipApi: {
    endpoint: "https://nisshin-rdk-repair-slip.azurewebsites.net/api/repair-slip",
    scopes: [
      "https://nisshinrdk.onmicrosoft.com/a29ef36f-99f6-4c0d-ae42-ee5672bd47c7/Employee.All",
    ],
  },
  gift1Api: {
    endpoint: "https://nisshin-rdk-non-cash-item-gift1.azurewebsites.net/api/non-cash-item-gift1",
    scopes: [
      "https://nisshinrdk.onmicrosoft.com/a29ef36f-99f6-4c0d-ae42-ee5672bd47c7/Employee.All",
    ],
  },
  gift3Api: {
    endpoint: "https://nisshin-rdk-non-cash-item-gift3.azurewebsites.net/api/non-cash-item-gift3",
    scopes: [
      "https://nisshinrdk.onmicrosoft.com/a29ef36f-99f6-4c0d-ae42-ee5672bd47c7/Employee.All",
    ],
  },
  gift2Api: {
    endpoint: "https://nisshin-rdk-non-cash-item-gift2.azurewebsites.net/api/non-cash-item-gift2",
    scopes: [
      "https://nisshinrdk.onmicrosoft.com/a29ef36f-99f6-4c0d-ae42-ee5672bd47c7/Employee.All",
    ],
  },
  gift4Api: {
    endpoint: "https://nisshin-rdk-non-cash-item-gift4.azurewebsites.net/api/non-cash-item-gift4",
    scopes: [
      "https://nisshinrdk.onmicrosoft.com/a29ef36f-99f6-4c0d-ae42-ee5672bd47c7/Employee.All",
    ],
  },
  qrApi: {
    endpoint: "https://nisshin-rdk-non-cash-item-qr.azurewebsites.net/api/non-cash-item-qr",
    scopes: [
      "https://nisshinrdk.onmicrosoft.com/a29ef36f-99f6-4c0d-ae42-ee5672bd47c7/Employee.All",
    ],
  },
  memberApi: {
    endpoint: "https://nisshin-rdk-member.azurewebsites.net/api/member",
    scopes: [
      "https://nisshinrdk.onmicrosoft.com/a29ef36f-99f6-4c0d-ae42-ee5672bd47c7/Employee.All",
    ],
  },
  deliveryApi: {
    endpoint: "https://nisshin-rdk-delivery.azurewebsites.net/api/delivery",
    scopes: [
      "https://nisshinrdk.onmicrosoft.com/a29ef36f-99f6-4c0d-ae42-ee5672bd47c7/Employee.All",
    ],
  },
  customerOrderReceptionSlipApi: {
    endpoint: "https://nisshin-rdk-customer-order-reception-slip.azurewebsites.net/api/customer-order-reception-slip",
    scopes: [
      "https://nisshinrdk.onmicrosoft.com/a29ef36f-99f6-4c0d-ae42-ee5672bd47c7/Employee.All",
    ],
  },
  customerOrderReceptionSlipIssueQuotationApi: {
    endpoint: "https://nisshin-rdk-customer-order-reception-slip.azurewebsites.net/api/issue-reception-slip",
    scopes: [
      "https://nisshinrdk.onmicrosoft.com/a29ef36f-99f6-4c0d-ae42-ee5672bd47c7/Employee.All",
    ],
  },
  CustomerOrderApi: {
    endpoint: "https://nisshin-rdk-customer-order.azurewebsites.net/api/customer-order",
    scopes: [
      "https://nisshinrdk.onmicrosoft.com/a29ef36f-99f6-4c0d-ae42-ee5672bd47c7/Employee.All",
    ],
  },
  StorePriceApi: {
    endpoint: "https://nisshin-rdk-store-price.azurewebsites.net/api/store-price",
    scopes: [
      "https://nisshinrdk.onmicrosoft.com/a29ef36f-99f6-4c0d-ae42-ee5672bd47c7/Employee.All",
    ],
  },
  rentalApi: {
    endpoint: "https://nisshin-rdk-rental.azurewebsites.net/api/rental",
    scopes: [
      "https://nisshinrdk.onmicrosoft.com/a29ef36f-99f6-4c0d-ae42-ee5672bd47c7/Employee.All",
    ],
  },
  rentalProductApi: {
    endpoint: "https://nisshin-rdk-rental-product.azurewebsites.net/api/rental-product",
    scopes: [
      "https://nisshinrdk.onmicrosoft.com/a29ef36f-99f6-4c0d-ae42-ee5672bd47c7/Employee.All",
    ],
  },
  rentalSlipApi: {
    endpoint: "https://nisshin-rdk-rental-slip.azurewebsites.net/api/rental-slip",
    scopes: [
      "https://nisshinrdk.onmicrosoft.com/a29ef36f-99f6-4c0d-ae42-ee5672bd47c7/Employee.All",
    ],
  },
  accountsReceivableAggregateApi: {
    endpoint: "https://nisshin-rdk-accounts-receivable-aggregate.azurewebsites.net/api/accounts-receivable-aggregate",
    scopes: [
      "https://nisshinrdk.onmicrosoft.com/a29ef36f-99f6-4c0d-ae42-ee5672bd47c7/Employee.All",
    ],
  },
  clientWorkingFieldApi: {
    endpoint: "https://nisshin-rdk-client-working-field.azurewebsites.net/api/client-working-field",
    scopes: [
      "https://nisshinrdk.onmicrosoft.com/a29ef36f-99f6-4c0d-ae42-ee5672bd47c7/Employee.All",
    ],
  },
  accountsPayableAggregateApi: {
    endpoint: "https://nisshin-rdk-accounts-payable-aggregate.azurewebsites.net/api/accounts-payable-aggregate",
    scopes: [
      "https://nisshinrdk.onmicrosoft.com/a29ef36f-99f6-4c0d-ae42-ee5672bd47c7/Employee.All",
    ],
  },
  billingDataCreationApi: {
    endpoint: "https://nisshin-rdk-accounts-receivable-aggregate.azurewebsites.net/api/billing-data-creation",
    scopes: [
      "https://nisshinrdk.onmicrosoft.com/a29ef36f-99f6-4c0d-ae42-ee5672bd47c7/Employee.All",
    ],
  },
  billApi: {
    endpoint: "https://nisshin-rdk-bill.azurewebsites.net/api/bill",
    scopes: [
      "https://nisshinrdk.onmicrosoft.com/a29ef36f-99f6-4c0d-ae42-ee5672bd47c7/Employee.All",
    ],
  },
  billDetailApi: {
    endpoint: "https://nisshin-rdk-bill-detail.azurewebsites.net/api/bill-detail",
    scopes: [
      "https://nisshinrdk.onmicrosoft.com/a29ef36f-99f6-4c0d-ae42-ee5672bd47c7/Employee.All",
    ],
  },
  depositApi: {
    endpoint: "https://nisshin-rdk-deposit.azurewebsites.net/api/deposit",
    scopes: [
      "https://nisshinrdk.onmicrosoft.com/a29ef36f-99f6-4c0d-ae42-ee5672bd47c7/Employee.All",
    ],
  },
  depositDetailApi: {
    endpoint: "https://nisshin-rdk-deposit-detail.azurewebsites.net/api/deposit-detail",
    scopes: [
      "https://nisshinrdk.onmicrosoft.com/a29ef36f-99f6-4c0d-ae42-ee5672bd47c7/Employee.All",
    ],
  },
  accountsReceivableBalanceApi: {
    endpoint: "https://nisshin-rdk-accounts-receivable-balance.azurewebsites.net/api/accounts-receivable-balance",
    scopes: [
      "https://nisshinrdk.onmicrosoft.com/a29ef36f-99f6-4c0d-ae42-ee5672bd47c7/Employee.All",
    ],
  },
  paymentDataCreationApi: {
    endpoint: "https://nisshin-rdk-accounts-payable-aggregate.azurewebsites.net/api/payment-data-creation",
    scopes: [
      "https://nisshinrdk.onmicrosoft.com/a29ef36f-99f6-4c0d-ae42-ee5672bd47c7/Employee.All",
    ],
  },
  paymentApi: {
    endpoint: "https://nisshin-rdk-payment.azurewebsites.net/api/payment",
    scopes: [
      "https://nisshinrdk.onmicrosoft.com/a29ef36f-99f6-4c0d-ae42-ee5672bd47c7/Employee.All",
    ],
  },
  paymentDetailApi: {
    endpoint: "https://nisshin-rdk-payment-detail.azurewebsites.net/api/payment-detail",
    scopes: [
      "https://nisshinrdk.onmicrosoft.com/a29ef36f-99f6-4c0d-ae42-ee5672bd47c7/Employee.All",
    ],
  },
  accountsPayableBalanceApi: {
    endpoint: "https://nisshin-rdk-accounts-payable-balance.azurewebsites.net/api/accounts-payable-balance",
    scopes: [
      "https://nisshinrdk.onmicrosoft.com/a29ef36f-99f6-4c0d-ae42-ee5672bd47c7/Employee.All",
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
