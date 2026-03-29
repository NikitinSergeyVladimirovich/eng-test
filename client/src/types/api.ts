export type UserRole = 'admin' | 'survivor' | 'nikita';

export interface AuthRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: { login: string; role: UserRole };
}

export interface MeResponse {
  user: { login: string; role: UserRole };
}

export interface Round {
  uuid: string;
  start_datetime: string;
  end_datetime: string;
  status: 'cooldown' | 'active' | 'finished';
}

export type RoundsResponse = Round[];

export interface RoundWithScore {
  round: Round;
  currentUserScore?: number;
}

export interface RoundWithResults extends RoundWithScore {
  totalScore: number;
  bestPlayer: { username: string; score: number } | null;
  currentUserScore: number;
}

export type RoundResponse = RoundWithScore | RoundWithResults;

export interface TapRequest {
  uuid: string;
}

export interface TapResponse {
  message: string;
  score: number;
}

export type CreateRoundResponse = Round;
