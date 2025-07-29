export interface ShortenedUrl {
  id: string;
  originalUrl: string;
  shortCode: string;
  shortUrl: string;
  createdAt: string;
  expiresAt: string;
  clickCount: number;
  clicks: ClickData[];
}

export interface ClickData {
  id: string;
  timestamp: string;
  source: string;
  location: string;
  userAgent?: string;
  ipAddress?: string;
}

export interface UrlShortenRequest {
  originalUrl: string;
  validityMinutes?: number;
  customShortCode?: string;
}

export interface UrlShortenResponse {
  success: boolean;
  data?: ShortenedUrl;
  error?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface AppState {
  shortenedUrls: ShortenedUrl[];
  loading: boolean;
  error: string | null;
}

export interface UrlFormData {
  originalUrl: string;
  validityMinutes: number;
  customShortCode: string;
}

export interface UrlFormErrors {
  originalUrl?: string;
  validityMinutes?: string;
  customShortCode?: string;
} 