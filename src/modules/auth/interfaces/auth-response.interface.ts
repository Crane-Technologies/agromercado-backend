import { UserPayload } from './tokens-response.interface';

export interface TokensResponse {
  access_token: string;
  refresh_token: string;
}

export interface AuthResponse {
  user: UserPayload;
  tokens: TokensResponse;
}