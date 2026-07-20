import "dotenv/config";
import { NextFunction, Request, Response } from "express";
import rateLimit from "express-rate-limit";

const parsePositiveInteger = (value: string | undefined, fallback: number) => {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const windowMs =
  parsePositiveInteger(process.env.RATE_LIMIT_WINDOW_MINUTES, 15) * 60 * 1000;

export const apiLimiter = rateLimit({
  windowMs,
  limit: parsePositiveInteger(process.env.RATE_LIMIT_MAX_REQUESTS, 200),
  message: {
    error: "Too many requests. Please try again later.",
    code: "RATE_LIMITED",
  },
  standardHeaders: "draft-8",
  legacyHeaders: false,
  validate: {
    trustProxy: false,
    xForwardedForHeader: false,
  },
});

export const authenticationLimiter = rateLimit({
  windowMs,
  limit: parsePositiveInteger(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS, 10),
  message: {
    error: "Too many authentication attempts. Please try again later.",
    code: "AUTH_RATE_LIMITED",
  },
  standardHeaders: "draft-8",
  legacyHeaders: false,
  validate: {
    trustProxy: false,
    xForwardedForHeader: false,
  },
});

export function apiSecurityHeaders(
  _req: Request,
  res: Response,
  next: NextFunction
): void {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(), usb=()"
  );
  next();
}
