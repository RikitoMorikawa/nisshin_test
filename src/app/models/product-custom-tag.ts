/**
 * APIからのレスポンス
 */
export interface ProductCustomTagApiResponse {
  message: string;
  totalItems: number;
  data: ProductCustomTag[];
}

/**
 * 商品カスタムタグ関連
 */
export interface ProductCustomTag {
  id: number;
  product_id: number;
  custom_tag_id: number;
  created_at: string;
  product_name: string;
  custom_tag_name: string;
  custom_tag_value: string;
}
