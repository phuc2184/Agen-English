import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

/**
 * UnlimitedAccessGuard:
 * If user.is_unlimited === true, this guard always passes.
 * Attach this guard to AI-related routes to bypass rate-limits/token costs
 * for users with the is_unlimited flag.
 * 
 * Usage: Apply BEFORE any rate-limit middleware.
 * If the user is unlimited, subsequent rate-limit checks should be skipped.
 */
@Injectable()
export class UnlimitedAccessGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (user && user.is_unlimited) {
      // Flag the request so downstream rate-limiters can skip
      request.skipRateLimit = true;
    }

    // Always allow through; this guard only sets the flag
    return true;
  }
}
