// ─────────────────────────────────────────────────────────────────────────────
// Meridian Airlines Claims Platform — Mock Data Barrel
// Re-exports from split data files for backwards compatibility
// ─────────────────────────────────────────────────────────────────────────────

export { mockUsers, mockPassengers } from './users-data';
export { mockFlights, mockDisruptions, mockDocuments, flightById, disruptionByFlightId, documentsByClaimId } from './flights-data';
export {
  mockClaims,
  mockAuditEvents,
  mockBusinessRules,
  mockRuleEvaluations,
  mockQCReviews,
  mockNotifications,
  analyticsData,
} from './claims-data';
