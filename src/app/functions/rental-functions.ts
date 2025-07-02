import { Rental } from '../models/rental';
import { RentalProduct } from '../models/rental-product';

/**
 * レンタル商品とレンタル予約をマッピングするための型
 */
export type CombinedRental = {
  rental: Rental;
  rentalProduct: RentalProduct;
};

/**
 * 予約状況一覧のヘッダーの型
 */
export type ReservationStatusHeader = {
  value1: string;
  value2: string;
  width: string;
  leftPosition: string;
  isCenter: boolean;
};

/**
 * 予約状況一覧のボディの型
 */
export type ReservationStatusBody = {
  value: string | RentalProduct;
  width: string;
  leftPosition: string;
  isCenter: boolean;
};

/**
 * 指定した日付に指定した日数を加算する関数
 * @param date
 * @param days
 * @returns
 */
function addDays(date: Date, days: number): Date {
  let result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * 指定したフォーマット（月/日）で日付を文字列化する関数
 * @param date
 * @returns
 */
function formatDate(date: Date): string {
  let month = date.getMonth() + 1; // JavaScriptの月は0から始まるため1を足す
  let day = date.getDate();
  return `${month}/${day}`;
}

/**
 * 指定した日付の曜日を日本語で取得する関数
 * @param date
 * @returns
 */
function getDayOfWeek(date: Date): string {
  const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
  return dayNames[date.getDay()];
}

/**
 * 対象日のレンタル状況を判定して○×△の文字列の配列を返す
 *
 * @param displayStartDate Date - 表示開始日
 * @param displayPeriod number - 表示期間
 * @param scheduledRentalDate Date - 貸出予定日
 * @param scheduledReturnDate Date - 返却予定日
 * @param rentalDate Date - 貸出日
 *
 * 開始日から指定表示期間までの各日について以下の条件で判定する
 *
 * 1. 対象日が貸出予定日以上返却予定日以下の場合 -> '△'
 * 2. 対象日が貸出日以上返却予定日以下の場合 -> '×'
 * 3. それ以外 -> '○'
 *
 * @return string[] 対象期間のレンタル状況の配列
 */
function calculateRentalPeriod(
  displayStartDate: Date,
  displayPeriod: number,
  scheduledRentalDate: Date,
  scheduledReturnDate: Date,
  mark_string: string
  /*rentalDate: Date*/
): string[] {
  // Invalid Dateを判定するための変数
  const invalidDate = new Date('Invalid Date');

  // 開始日から終了日までの各日付を格納する配列を生成
  let dates: string[] = [];

  // 時間を判定対象から除外するために各日付の時間を0にする
  const displayStartDateHour0 = new Date(displayStartDate.getTime());
  const scheduledRentalDateHour0 = new Date(scheduledRentalDate.getTime());
  const scheduledReturnDateHour0 = new Date(scheduledReturnDate.getTime());
  /*const rentalDateHour0 = new Date(rentalDate.getTime());*/
  displayStartDateHour0.setHours(0, 0, 0, 0);
  scheduledRentalDateHour0.setHours(0, 0, 0, 0);
  scheduledReturnDateHour0.setHours(0, 0, 0, 0);
  /*rentalDateHour0.setHours(0, 0, 0, 0);*/

  // 開始日をcurrentにコピー
  let current = new Date(displayStartDateHour0.getTime());
  let datess: string[] = [];
  // 開始日から終了日までの各日付をdates配列に追加
  for (let i = 0; i < displayPeriod; i++) {
    if (
      // 日付が貸出予定日から返却予定日までの間にあるかどうかをチェック
      current >= scheduledRentalDateHour0 &&
      current <= scheduledReturnDateHour0
    ) {
      // '△'を追加
      dates.push(mark_string);
    } else {
      // それ以外の場合は'○'を追加
      dates.push('○');
    }
    // currentを1日進める
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

/**
 * レンタル商品とレンタル予約をマッピングする
 * @param rentalProducts - RentalProduct[] レンタル商品
 * @param rentals - Rental[] レンタル予約
 * @returns CombinedRental[] レンタル商品とレンタル予約をマッピングしたデータ
 */
export function mapProductsToRentals(
  rentalProducts: RentalProduct[],
  rentals: Rental[]
): CombinedRental[] {
  const mapped: CombinedRental[] = [];

  for (const rentalProduct of rentalProducts) {
    const productRentals = rentals.filter(
      (rental) => rental.rental_product_id === rentalProduct.id
    );

    for (const rental of productRentals) {
      mapped.push({
        rental: rental,
        rentalProduct: rentalProduct,
      });
    }
  }

  return mapped;
}

/**
 * 開始日から指定表示期間分の予約状況表示用のヘッダーを作成する
 * @param displayStartDate - Date 開始日
 * @param displayPeriod - number 表示期間
 * @returns ReservationStatusHeader[] 予約状況表示用のヘッダー
 */
export function createReservationStatusHeader(
  displayStartDate: Date,
  displayPeriod: number
): ReservationStatusHeader[] {
  const baseHeaders = [
    {
      value1: '選択',
      value2: '',
      width: 'min-w-[48px]',
      leftPosition: 'left-0',
      isCenter: true,
    },
    {
      value1: '商品ID',
      value2: '',
      width: 'min-w-[120px]',
      leftPosition: 'left-[48px]',
      isCenter: false,
    },
    {
      value1: '商品名',
      value2: '',
      width: 'min-w-[220px]',
      leftPosition: 'left-[168px]',
      isCenter: false,
    },
    {
      value1: 'レンタル料金',
      value2: '',
      width: 'min-w-[120px]',
      leftPosition: 'left-[388px]',
      isCenter: false,
    },
    {
      value1: 'ステータス',
      value2: '',
      width: 'min-w-[100px]',
      leftPosition: 'left-[508px]',
      isCenter: false,
    },
  ];

  const dateHeaders = [...Array(displayPeriod)].map((_, day) => {
    const date = addDays(displayStartDate, day);
    const dateStr = formatDate(date);
    const dayOfWeek = getDayOfWeek(date);
    return {
      value1: dateStr,
      value2: dayOfWeek,
      width: 'min-w-[48px]',
      leftPosition: '',
      isCenter: true,
    };
  });

  return [...baseHeaders, ...dateHeaders];
}

/**
 * 予約状況一覧のボディのデータを生成する
 * @param combinedRentals - CombinedRental[] レンタル商品とレンタル予約をマッピングしたデータ
 * @param displayStartDate - Date 表示開始日
 * @param displayPeriod - number 表示期間
 * @returns ReservationStatusBody[][] 予約状況一覧のボディのデータ
 */
export function generateBodyData(
  combinedRentals: CombinedRental[],
  rentalProducts: RentalProduct[],
  displayStartDate: Date,
  displayPeriod: number
): ReservationStatusBody[][] {
  return rentalProducts.map((rentalProduct) => {
    // 当該商品のレンタル予約が存在すればそれを取得、なければundefinedとする
    const combinedRental = combinedRentals.filter((cr) => {
      return cr.rentalProduct.id === rentalProduct.id;
    });
    // const rental = combinedRental.rental;
    // const rentalProduct = combinedRental.rentalProduct;

    // レンタル商品の情報
    const baseInfo: ReservationStatusBody[] = [
      {
        value: rentalProduct,
        width: 'min-w-[48px]',
        leftPosition: 'left-0',
        isCenter: true,
      },
      {
        value: `${rentalProduct.id}`,
        width: 'min-w-[120px]',
        leftPosition: 'left-[48px]',
        isCenter: false,
      },
      {
        value: rentalProduct.name,
        width: 'min-w-[220px]',
        leftPosition: 'left-[168px]',
        isCenter: false,
      },
      {
        value: `${rentalProduct.selling_price} 円`,
        width: 'min-w-[120px]',
        leftPosition: 'left-[388px]',
        isCenter: false,
      },
      {
        value: `${rentalProduct.division_status_value}`,
        width: 'min-w-[100px]',
        leftPosition: 'left-[508px]',
        isCenter: false,
      },
    ];

    let dateStatuses: ReservationStatusBody[] = [];
    let rentalStatuses: ReservationStatusBody[] = [];
    // 対象日のレンタル状況
    if (combinedRental.length) {
      console.log(combinedRental);

      const rental = combinedRental[0].rental;
      /*for(const index in combinedRental) {
        combinedRental[index].rental
      }*/
      // 予約 △のデータ
      dateStatuses = calculateRentalPeriod(
        displayStartDate,
        displayPeriod,
        new Date(rental.scheduled_rental_date),
        new Date(rental.scheduled_return_date),
        '△'
      ).map((status) => ({
        value: status,
        width: 'min-w-[48px]',
        leftPosition: '',
        isCenter: true,
      }));

      // 予約中 = rental_date ～ 本日 × のデータ
      if (rental.rental_date) {
        let rental_start = new Date(rental.rental_date);
        let return_date = new Date().toLocaleString();
        if (rental.return_date) {
          return_date = rental.return_date;
        }

        rentalStatuses = calculateRentalPeriod(
          displayStartDate,
          displayPeriod,
          new Date(rental_start),
          new Date(return_date),
          '×'
        ).map((status) => ({
          value: status,
          width: 'min-w-[48px]',
          leftPosition: '',
          isCenter: true,
        }));
        // '×' をマージ
        for (const i in rentalStatuses) {
          if (rentalStatuses[i].value === '×') {
            dateStatuses[i].value = '×';
          }
        }
      }

      delete combinedRental[0];

      for (const index in combinedRental) {
        console.log(combinedRental[index].rental);
        let other_rental = combinedRental[index].rental;
        let add_dateStatuses: ReservationStatusBody[] = [];
        let add_rentalStatuses: ReservationStatusBody[] = [];

        add_dateStatuses = calculateRentalPeriod(
          displayStartDate,
          displayPeriod,
          new Date(other_rental.scheduled_rental_date),
          new Date(other_rental.scheduled_return_date),
          '△'
        ).map((status) => ({
          value: status,
          width: 'min-w-[48px]',
          leftPosition: '',
          isCenter: true,
        }));

        // '△' をマージ
        for (const i in add_dateStatuses) {
          if (add_dateStatuses[i].value === '△') {
            dateStatuses[i].value = '△';
          }
        }

        // 貸出中 = rental_date ～ 返却日 × のデータ
        // 上書きする
        if (other_rental.rental_date) {
          let rental_start = new Date(other_rental.rental_date);
          let return_date = new Date().toLocaleString();
          if (other_rental.return_date) {
            return_date = other_rental.return_date;
          }
          add_rentalStatuses = calculateRentalPeriod(
            displayStartDate,
            displayPeriod,
            new Date(rental_start),
            new Date(return_date),
            '×'
          ).map((status) => ({
            value: status,
            width: 'min-w-[48px]',
            leftPosition: '',
            isCenter: true,
          }));
          // '×' をマージ
          for (const i in rentalStatuses) {
            if (add_rentalStatuses[i].value === '×') {
              dateStatuses[i].value = '×';
            }
          }
        }
      }
    } else {
      dateStatuses = [...Array(displayPeriod)].map(() => ({
        value: '○',
        width: 'min-w-[48px]',
        leftPosition: '',
        isCenter: true,
      }));
    }

    return [...baseInfo, ...dateStatuses];
  });
}
