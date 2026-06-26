export const RETURN_TO_KEY = 'returnTo';

export const APP_ROUTES = {
  ROOT: '/',
  NOT_FOUND: '*',

  // Guest / Unauthenticated routes
  LOGIN: '/login',
  AUTH_CALLBACK: '/auth/callback',
  ACCEPT_INVITE: '/accept-invite',

  // Onboarding
  ONBOARDING: '/onboarding',

  // Protected application routes
  APP: {
    DASHBOARD: '/dashboard',
    BOARD: '/board',
    MEMBERS: '/members',
  },
} as const;
