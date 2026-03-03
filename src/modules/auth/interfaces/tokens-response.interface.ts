// Interfaz UserPayload para incluir la información importante del usuario, sin exponer datos sensibles (password)
// Es mejor llamar al user con este payload que hacer un return del user desde la BBDD.
export interface UserPayload {
  app_user_id: string;
  email: string;
  role_id: number;
  phone: string;
  document_type: string;
  document_number: number;
  is_verified: boolean;
}

export interface RefreshToken {
  refresh_token_id: string;
  user_id: string;
  token_hash: string;
  expires_at: Date;
  created_at: Date;
  revoked: boolean;
}

export interface CreateRefreshTokenDto {
  user_id: string;
  token_hash: string;
  expires_at: Date;
}
