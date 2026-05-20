// ── Roles ────────────────────────────────────────────
export enum UserRole {
  REQUESTER = "Requester",
  VALIDATOR  = "Validator",
}

// ── Request statuses ─────────────────────────────────
export enum RequestStatus {
  PENDING   = "Pending",
  APPROVED  = "Approved",
  REJECTED  = "Rejected",
  CANCELLED = "Cancelled",
}

// Filter options for the validator view (includes "All" sentinel)
export const STATUS_FILTER_OPTIONS = [
  "All",
  RequestStatus.PENDING,
  RequestStatus.APPROVED,
  RequestStatus.REJECTED,
  RequestStatus.CANCELLED,
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

// ── Helpers ──────────────────────────────────────────

/** Maps a user role to its dashboard route. Single source of truth. */
export function roleToRoute(role: UserRole | string): AppRoute {
  return role === UserRole.REQUESTER ? ROUTES.REQUESTER : ROUTES.VALIDATOR;
}
