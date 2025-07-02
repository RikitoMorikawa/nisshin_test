type GeneralConst = {
  readonly NO_IMAGE_PATH: string;
  readonly PLEASE_SELECT: string;
  readonly IMAGE_MAX_FILE_SIZE: number;
  readonly IMAGE_MAX_FILE_SIZE_FOR_DISPLAY: number;
  readonly ROUTE_DATA_BREADCRUMB: string;
  readonly DATA_PERMISSION: {
    readonly CODE: {
      readonly PUBLIC: number;
      readonly PROVISIONAL: number;
      readonly PRIVATE: number;
    };
    readonly VALUE: {
      readonly PUBLIC: string;
      readonly PROVISIONAL: string;
      readonly PRIVATE: string;
    };
  };
};

// アップロード可能な画像ファイルの最大サイズを指定
const imageMaxFileSize = 1024 * 1024 * 3;

export const generalConst: GeneralConst = {
  NO_IMAGE_PATH: '/assets/images/no_image.png',
  PLEASE_SELECT: '選択してください',
  IMAGE_MAX_FILE_SIZE: imageMaxFileSize,
  IMAGE_MAX_FILE_SIZE_FOR_DISPLAY: Math.floor(imageMaxFileSize / 1000000),
  ROUTE_DATA_BREADCRUMB: 'breadcrumb',
  DATA_PERMISSION: {
    CODE: {
      PUBLIC: 1,
      PROVISIONAL: 2,
      PRIVATE: 3,
    },
    VALUE: {
      PUBLIC: '公開中',
      PROVISIONAL: '仮保存',
      PRIVATE: '非公開',
    },
  },
};
