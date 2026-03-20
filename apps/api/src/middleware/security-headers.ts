import { Next } from 'hono';
import { AppContextType } from '../types';

export interface SecurityHeadersOptions {
  contentSecurityPolicy?: string | false;
  crossOriginEmbedderPolicy?: boolean;
  crossOriginOpenerPolicy?: boolean;
  crossOriginResourcePolicy?: boolean;
  dnsPrefetchControl?: boolean;
  frameguard?: {
    action: 'DENY' | 'SAMEORIGIN' | 'ALLOW-FROM';
    domain?: string;
  } | false;
  hidePoweredBy?: boolean;
  hsts?: {
    maxAge?: number;
    includeSubDomains?: boolean;
    preload?: boolean;
  } | false;
  ieNoOpen?: boolean;
  noSniff?: boolean;
  referrerPolicy?: string | false;
  xssFilter?: boolean;
}

export function securityHeaders(options: SecurityHeadersOptions = {}) {
  const {
    contentSecurityPolicy = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
    crossOriginEmbedderPolicy = true,
    crossOriginOpenerPolicy = true,
    crossOriginResourcePolicy = true,
    dnsPrefetchControl = true,
    frameguard = { action: 'DENY' },
    hidePoweredBy = true,
    hsts = {
      maxAge: 63072000, // 2 years
      includeSubDomains: true,
      preload: true,
    },
    ieNoOpen = true,
    noSniff = true,
    referrerPolicy = 'strict-origin-when-cross-origin',
    xssFilter = true,
  } = options;

  return async (c: AppContextType, next: any) => {
    // Content Security Policy
    if (contentSecurityPolicy) {
      c.header('Content-Security-Policy', contentSecurityPolicy);
    }

    // Cross-Origin Embedder Policy
    if (crossOriginEmbedderPolicy) {
      c.header('Cross-Origin-Embedder-Policy', 'require-corp');
    }

    // Cross-Origin Opener Policy
    if (crossOriginOpenerPolicy) {
      c.header('Cross-Origin-Opener-Policy', 'same-origin');
    }

    // Cross-Origin Resource Policy
    if (crossOriginResourcePolicy) {
      c.header('Cross-Origin-Resource-Policy', 'cross-origin');
    }

    // DNS Prefetch Control
    if (dnsPrefetchControl) {
      c.header('X-DNS-Prefetch-Control', 'off');
    }

    // Frame guard (X-Frame-Options)
    if (frameguard) {
      if (frameguard.action === 'ALLOW-FROM' && frameguard.domain) {
        c.header('X-Frame-Options', `ALLOW-FROM ${frameguard.domain}`);
      } else {
        c.header('X-Frame-Options', frameguard.action);
      }
    }

    // Hide X-Powered-By
    if (hidePoweredBy) {
      c.header('X-Powered-By', 'Console AI');
    }

    // HSTS (HTTP Strict Transport Security)
    if (hsts) {
      let hstsHeader = `max-age=${hsts.maxAge || 63072000}`;
      if (hsts.includeSubDomains) hstsHeader += '; includeSubDomains';
      if (hsts.preload) hstsHeader += '; preload';
      c.header('Strict-Transport-Security', hstsHeader);
    }

    // IE No Open
    if (ieNoOpen) {
      c.header('X-Download-Options', 'noopen');
    }

    // No Sniff (X-Content-Type-Options)
    if (noSniff) {
      c.header('X-Content-Type-Options', 'nosniff');
    }

    // Referrer Policy
    if (referrerPolicy) {
      c.header('Referrer-Policy', referrerPolicy);
    }

    // XSS Filter
    if (xssFilter) {
      c.header('X-XSS-Protection', '1; mode=block');
    }

    // Permissions Policy
    c.header(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()'
    );

    return next();
  };
}

export function createDefaultSecurityHeaders() {
  return securityHeaders({});
}
