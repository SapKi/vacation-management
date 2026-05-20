// ── Roles ────────────────────────────────────────────
export enum UserRole {
  REQUESTER = "Requester",
  VALIDATOR  = "Validator",
}

// ── Request statuses ─────────────────────────────────
export enum RequestStatus {
  PENDING  = "Pending",
  APPROVED = "Approved",
  REJECTED = "Rejected",
}

// Filter options for the validator view (includes "All" sentinel)
export const STATUS_FILTER_OPTIONS = [
  "All",
  RequestStatus.PENDING,
  RequestStatus.APPROVED,
  RequestStatus.REJECTED,
] as const;

export type StatusFilterOption = typeof STATUS_FILTER_OPTIONS[number];

// ── Routes ───────────────────────────────────────────
export const ROUTES = {
  HOME:      "/",
  LOGIN:     "/login",
  SIGNUP:    "/signup",
  REQUESTER: "/requester",
  VALIDATOR: "/validator",
} as const;

export type AppRoute = typeof ROUTES[keyof typeof ROUTES];

// ── Timing ───────────────────────────────────────────
export const NOTIFICATION_DISMISS_MS = 3000;
export const FORM_SUCCESS_DISMISS_MS  = 4000;

// ── Helpers ──────────────────────────────────────────

/** Maps a user role to its dashboard route. Single source of truth. */
export function roleToRoute(role: UserRole | string): AppRoute {
  return role === UserRole.REQUESTER ? ROUTES.REQUESTER : ROUTES.VALIDATOR;
}
