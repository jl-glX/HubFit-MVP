import { NextFunction, Request, Response } from "express";
import { db } from "../db/client.js";
import { verifyToken } from "../services/auth.js";
import { readSessionToken } from "../lib/session-cookie.js";

export type UserRole = "member" | "trainer" | "admin";

export interface AuthenticatedUser {
  sessionId: string;
  userId: string;
  email: string;
  name: string;
  avatarDataUrl: string;
  role: UserRole;
}

function unauthorized(res: Response, message = "Authentication required") {
  res.status(401).json({ error: message, code: "UNAUTHENTICATED" });
}

function forbidden(
  res: Response,
  message = "You do not have permission to perform this action",
) {
  res.status(403).json({ error: message, code: "FORBIDDEN" });
}

export function getAuthenticatedUser(res: Response): AuthenticatedUser {
  return res.locals.auth as AuthenticatedUser;
}

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const token = readSessionToken(req);
  if (!token) {
    unauthorized(res);
    return;
  }

  try {
    const session = await verifyToken(token);
    if (!session) {
      unauthorized(res, "Invalid or expired session");
      return;
    }

    res.locals.auth = session;
    next();
  } catch (error) {
    next(error);
  }
}

export function requireRole(...roles: UserRole[]) {
  return (_req: Request, res: Response, next: NextFunction): void => {
    const auth = getAuthenticatedUser(res);
    if (!roles.includes(auth.role)) {
      forbidden(res);
      return;
    }
    next();
  };
}

export function requireSelfParamOrRole(
  paramName: string,
  ...roles: UserRole[]
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const auth = getAuthenticatedUser(res);
    if (req.params[paramName] !== auth.userId && !roles.includes(auth.role)) {
      forbidden(res);
      return;
    }
    next();
  };
}

export function requireSelfBodyOrRole(bodyName: string, ...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const auth = getAuthenticatedUser(res);
    if (req.body?.[bodyName] !== auth.userId && !roles.includes(auth.role)) {
      forbidden(res);
      return;
    }
    next();
  };
}

export function requireTrainerClassOrRole(
  classParamName: string,
  ...roles: UserRole[]
) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const auth = getAuthenticatedUser(res);
      if (roles.includes(auth.role)) {
        next();
        return;
      }

      if (auth.role !== "trainer") {
        forbidden(res);
        return;
      }

      const gymClass = await db
        .selectFrom("gymClasses")
        .select("trainerId")
        .where("id", "=", req.params[classParamName])
        .executeTakeFirst();

      if (!gymClass || gymClass.trainerId !== auth.userId) {
        forbidden(res);
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
