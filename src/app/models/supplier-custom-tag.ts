/**
 * APIからのレスポンス
 */
export interface SupplierCustomTagApiResponse {
  message: string;
  totalItems: number;
  data: SupplierCustomTag[];
}

/**
 * 仕入先カスタムタグ関連
 */
export interface SupplierCustomTag {
  id: number;
  supplier_id: number;
  custom_tag_id: number;
  created_at: string;
  supplier_name: string;
  custom_tag_name: string;
  custom_tag_value: string;
}
