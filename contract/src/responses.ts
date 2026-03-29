import { Round, RoundWithScore, RoundWithResults } from './models';

// Типы ответов от API

export interface AuthResponse {
  access_token: string;
}

export interface TapResponse {
  message: string;
  score: number;
}

export interface RoundsResponse extends Array<Omit<Round, 'score'>> {}

export interface RoundResponse extends RoundWithScore {}

export interface RoundWithResultsResponse extends RoundWithResults {}

export interface CreateRoundResponse extends Round {}

// Типы для ошибок API
export interface ApiError {
  statusCode: number;
  message: string | string[];
  error: string;
}
