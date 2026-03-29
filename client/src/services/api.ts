import type {
  AuthRequest,
  LoginResponse,
  MeResponse,
  RoundsResponse,
  RoundResponse,
  TapResponse,
  CreateRoundResponse,
  UserRole,
} from '../types/api';

const apiBase = () => (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

function requestUrl(path: string): string {
  const base = apiBase();
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}

async function parseJson<T>(response: Response): Promise<T> {
  const text = await response.text();
  if (!text) {
    return {} as T;
  }
  return JSON.parse(text) as T;
}

class ApiService {
  private user: { username: string; role: UserRole } | null = null;

  private async fetchWithAuth(
    path: string,
    init: RequestInit = {},
  ): Promise<Response> {
    const headers = new Headers(init.headers);
    if (!headers.has('Content-Type') && init.body) {
      headers.set('Content-Type', 'application/json');
    }
    return fetch(requestUrl(path), {
      ...init,
      credentials: 'include',
      headers,
    });
  }

  async loadSession(): Promise<boolean> {
    const response = await this.fetchWithAuth('/api/auth/me');
    if (!response.ok) {
      this.user = null;
      return false;
    }
    const data = await parseJson<MeResponse>(response);
    this.user = { username: data.user.login, role: data.user.role };
    return true;
  }

  getUser(): { username: string; role: UserRole } | null {
    return this.user;
  }

  async auth(credentials: AuthRequest): Promise<LoginResponse> {
    const response = await this.fetchWithAuth('/api/auth', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error('Authentication failed');
    }

    const data = await parseJson<LoginResponse>(response);
    this.user = { username: data.user.login, role: data.user.role };
    return data;
  }

  async logout(): Promise<void> {
    await this.fetchWithAuth('/api/auth/logout', { method: 'POST' });
    this.user = null;
  }

  async getRounds(): Promise<RoundsResponse> {
    const response = await this.fetchWithAuth('/api/rounds');
    if (!response.ok) {
      throw new Error('Failed to fetch rounds');
    }
    return parseJson<RoundsResponse>(response);
  }

  async getRound(uuid: string): Promise<RoundResponse> {
    const response = await this.fetchWithAuth(`/api/round/${uuid}`);
    if (!response.ok) {
      throw new Error('Failed to fetch round');
    }
    return parseJson<RoundResponse>(response);
  }

  async tap(uuid: string): Promise<TapResponse> {
    const response = await this.fetchWithAuth('/api/tap', {
      method: 'POST',
      body: JSON.stringify({ uuid }),
    });

    if (!response.ok) {
      throw new Error('Failed to perform tap');
    }

    return parseJson<TapResponse>(response);
  }

  async createRound(): Promise<CreateRoundResponse> {
    const response = await this.fetchWithAuth('/api/round', {
      method: 'POST',
    });

    if (!response.ok) {
      let message = 'Failed to create round';
      try {
        const err = (await parseJson<{ message?: string | string[] }>(response)) as {
          message?: string | string[];
        };
        if (typeof err.message === 'string') {
          message = err.message;
        } else if (Array.isArray(err.message)) {
          message = err.message.join(', ');
        }
      } catch {
        /* ignore */
      }
      throw new Error(message);
    }

    return parseJson<CreateRoundResponse>(response);
  }

  isAdmin(): boolean {
    return this.user?.role === 'admin';
  }
}

export const apiService = new ApiService();
