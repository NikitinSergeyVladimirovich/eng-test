import { Round } from './models';

// Типы запросов к API

export interface AuthRequest {
  username: string;
  password: string;
}

export interface TapRequest {
  uuid: string;
}

// Для POST /round - создание раунда (без параметров, но требует авторизации admin)
export interface CreateRoundRequest {
  // Пустой объект, так как все параметры вычисляются на сервере
}
