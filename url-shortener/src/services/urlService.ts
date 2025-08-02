import { 
  ShortenedUrl, 
  UrlShortenRequest, 
  UrlShortenResponse, 
  ClickData,
  ValidationError 
} from '../types';

class UrlService {
  private shortenedUrls: ShortenedUrl[] = [];
  private usedShortCodes: Set<string> = new Set();

  constructor() {
    this.loadUrlsFromStorage();
  }

  private generateShortCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let shortCode: string;
    
    do {
      shortCode = '';
      for (let i = 0; i < 6; i++) {
        shortCode += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    } while (this.usedShortCodes.has(shortCode));
    
    return shortCode;
  }

  private validateUrl(url: string): ValidationError | null {
    try {
      new URL(url);
      return null;
    } catch {
      return {
        field: 'originalUrl',
        message: 'Please enter a valid URL (e.g., https://example.com)'
      };
    }
  }

  private validateShortCode(shortCode: string): ValidationError | null {
    if (shortCode.length < 3 || shortCode.length > 20) {
      return {
        field: 'customShortCode',
        message: 'Short code must be between 3 and 20 characters'
      };
    }
    
    if (!/^[a-zA-Z0-9]+$/.test(shortCode)) {
      return {
        field: 'customShortCode',
        message: 'Short code can only contain letters and numbers'
      };
    }
    
    if (this.usedShortCodes.has(shortCode)) {
      return {
        field: 'customShortCode',
        message: 'This short code is already in use'
      };
    }
    
    return null;
  }

  private validateValidityMinutes(minutes: number): ValidationError | null {
    if (minutes < 1 || minutes > 525600) {
      return {
        field: 'validityMinutes',
        message: 'Validity must be between 1 minute and 1 year'
      };
    }
    
    return null;
  }

  async shortenUrl(request: UrlShortenRequest): Promise<UrlShortenResponse> {
    try {
      const urlValidation = this.validateUrl(request.originalUrl);
      if (urlValidation) {
        return { success: false, error: urlValidation.message };
      }

      if (request.customShortCode) {
        const shortCodeValidation = this.validateShortCode(request.customShortCode);
        if (shortCodeValidation) {
          return { success: false, error: shortCodeValidation.message };
        }
      }

      const validityMinutes = request.validityMinutes || 30;
      const validityValidation = this.validateValidityMinutes(validityMinutes);
      if (validityValidation) {
        return { success: false, error: validityValidation.message };
      }

      const shortCode = request.customShortCode || this.generateShortCode();
      
      const now = new Date();
      const expiresAt = new Date(now.getTime() + validityMinutes * 60000);
      
      const shortenedUrl: ShortenedUrl = {
        id: this.generateId(),
        originalUrl: request.originalUrl,
        shortCode,
        shortUrl: `${window.location.origin}/${shortCode}`,
        createdAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        clickCount: 0,
        clicks: []
      };

      this.shortenedUrls.push(shortenedUrl);
      this.usedShortCodes.add(shortCode);
      this.saveUrlsToStorage();

      return { success: true, data: shortenedUrl };
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  async shortenMultipleUrls(requests: UrlShortenRequest[]): Promise<UrlShortenResponse[]> {
    const results: UrlShortenResponse[] = [];
    
    for (const request of requests) {
      const result = await this.shortenUrl(request);
      results.push(result);
    }
    
    return results;
  }

  getShortenedUrl(shortCode: string): ShortenedUrl | null {
    const url = this.shortenedUrls.find(u => u.shortCode === shortCode);
    
    if (url) {
      if (new Date() > new Date(url.expiresAt)) {
        return null;
      }
      
      return url;
    } else {
      return null;
    }
  }

  recordClick(shortCode: string, source: string = 'direct'): void {
    const url = this.shortenedUrls.find(u => u.shortCode === shortCode);
    
    if (url) {
      const click: ClickData = {
        id: this.generateId(),
        timestamp: new Date().toISOString(),
        source,
        location: 'Unknown',
        userAgent: navigator.userAgent
      };
      
      url.clicks.push(click);
      url.clickCount++;
      
      this.saveUrlsToStorage();
    }
  }

  getAllShortenedUrls(): ShortenedUrl[] {
    return this.shortenedUrls.filter(url => new Date() <= new Date(url.expiresAt));
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private saveUrlsToStorage(): void {
    try {
      localStorage.setItem('shortenedUrls', JSON.stringify(this.shortenedUrls));
      localStorage.setItem('usedShortCodes', JSON.stringify(Array.from(this.usedShortCodes)));
    } catch (error) {
      console.error('Failed to save URLs to storage:', error);
    }
  }

  private loadUrlsFromStorage(): void {
    try {
      const storedUrls = localStorage.getItem('shortenedUrls');
      const storedCodes = localStorage.getItem('usedShortCodes');
      
      if (storedUrls) {
        this.shortenedUrls = JSON.parse(storedUrls);
      }
      
      if (storedCodes) {
        this.usedShortCodes = new Set(JSON.parse(storedCodes));
      }
    } catch (error) {
      console.error('Failed to load URLs from storage:', error);
    }
  }

  clearExpiredUrls(): void {
    const beforeCount = this.shortenedUrls.length;
    this.shortenedUrls = this.shortenedUrls.filter(url => new Date() <= new Date(url.expiresAt));
    const afterCount = this.shortenedUrls.length;
    
    if (beforeCount !== afterCount) {
      this.saveUrlsToStorage();
    }
  }
}

export default new UrlService(); 