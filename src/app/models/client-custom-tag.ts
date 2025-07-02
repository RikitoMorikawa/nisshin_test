/**
 * APIからのレスポンス
 */
export interface ClientCustomTagApiResponse {
  message: string;
  totalItems: number;
  data: ClientCustomTag[];
}

/**
 * 得意先カスタムタグ関連
 */
export interface ClientCustomTag {
  id: number;
  client_id: number;
  custom_tag_id: number;
  created_at: string;
  supplier_name: string;
  custom_tag_name: string;
  custom_tag_value: string;
}
