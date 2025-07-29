import logger from '../utils/logger';
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
    logger.info('URL Service initialized', { urlCount: this.shortenedUrls.length }, 'UrlService');
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
    if (minutes < 1 || minutes > 525600) { // Max 1 year
      return {
        field: 'validityMinutes',
        message: 'Validity must be between 1 minute and 1 year'
      };
    }
    
    return null;
  }

  async shortenUrl(request: UrlShortenRequest): Promise<UrlShortenResponse> {
    logger.info('URL shortening request received', { request }, 'UrlService');
    
    try {
      // Validate original URL
      const urlValidation = this.validateUrl(request.originalUrl);
      if (urlValidation) {
        logger.warn('Invalid URL provided', { url: request.originalUrl }, 'UrlService');
        return { success: false, error: urlValidation.message };
      }

      // Validate custom short code if provided
      if (request.customShortCode) {
        const shortCodeValidation = this.validateShortCode(request.customShortCode);
        if (shortCodeValidation) {
          logger.warn('Invalid custom short code', { shortCode: request.customShortCode }, 'UrlService');
          return { success: false, error: shortCodeValidation.message };
        }
      }

      // Validate validity minutes if provided
      const validityMinutes = request.validityMinutes || 30; // Default 30 minutes
      const validityValidation = this.validateValidityMinutes(validityMinutes);
      if (validityValidation) {
        logger.warn('Invalid validity minutes', { minutes: validityMinutes }, 'UrlService');
        return { success: false, error: validityValidation.message };
      }

      // Generate or use custom short code
      const shortCode = request.customShortCode || this.generateShortCode();
      
      // Create shortened URL
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

      // Add to storage
      this.shortenedUrls.push(shortenedUrl);
      this.usedShortCodes.add(shortCode);
      this.saveUrlsToStorage();

      logger.info('URL shortened successfully', { 
        shortCode, 
        originalUrl: request.originalUrl,
        expiresAt: expiresAt.toISOString()
      }, 'UrlService');

      return { success: true, data: shortenedUrl };
    } catch (error) {
      logger.error('Error shortening URL', { error, request }, 'UrlService');
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  async shortenMultipleUrls(requests: UrlShortenRequest[]): Promise<UrlShortenResponse[]> {
    logger.info('Multiple URL shortening request received', { count: requests.length }, 'UrlService');
    
    const results: UrlShortenResponse[] = [];
    
    for (const request of requests) {
      const result = await this.shortenUrl(request);
      results.push(result);
    }
    
    logger.info('Multiple URL shortening completed', { 
      total: requests.length, 
      successful: results.filter(r => r.success).length 
    }, 'UrlService');
    
    return results;
  }

  getShortenedUrl(shortCode: string): ShortenedUrl | null {
    const url = this.shortenedUrls.find(u => u.shortCode === shortCode);
    
    if (url) {
      // Check if URL has expired
      if (new Date() > new Date(url.expiresAt)) {
        logger.warn('Attempted to access expired URL', { shortCode }, 'UrlService');
        return null;
      }
      
      logger.info('URL accessed', { shortCode, originalUrl: url.originalUrl }, 'UrlService');
      return url;
    } else {
      logger.warn('URL not found', { shortCode }, 'UrlService');
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
        location: 'Unknown', // In a real app, this would be determined by IP geolocation
        userAgent: navigator.userAgent
      };
      
      url.clicks.push(click);
      url.clickCount++;
      
      this.saveUrlsToStorage();
      
      logger.info('Click recorded', { 
        shortCode, 
        source, 
        totalClicks: url.clickCount 
      }, 'UrlService');
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
      logger.error('Failed to save URLs to storage', { error }, 'UrlService');
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
      
      logger.info('URLs loaded from storage', { 
        urlCount: this.shortenedUrls.length,
        codeCount: this.usedShortCodes.size
      }, 'UrlService');
    } catch (error) {
      logger.error('Failed to load URLs from storage', { error }, 'UrlService');
    }
  }

  clearExpiredUrls(): void {
    const beforeCount = this.shortenedUrls.length;
    this.shortenedUrls = this.shortenedUrls.filter(url => new Date() <= new Date(url.expiresAt));
    const afterCount = this.shortenedUrls.length;
    
    if (beforeCount !== afterCount) {
      this.saveUrlsToStorage();
      logger.info('Expired URLs cleared', { 
        removed: beforeCount - afterCount,
        remaining: afterCount
      }, 'UrlService');
    }
  }
}

export default new UrlService(); 