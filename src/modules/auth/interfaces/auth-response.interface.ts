import { User } from '../../users/users.service';

export interface TokensResponse {
  access_token: string;
  refresh_token: string;
}

export interface AuthResponse {
  user: Partial<User>;
  tokens: TokensResponse;
}