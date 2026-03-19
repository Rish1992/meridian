import { create } from 'zustand';
import type { Claim, ClaimStatus } from '@/types';
import { mockClaims } from '@/data/mock-data';

// ─────────────────────────────────────────────────────────────────────────────
// Filter shape
// ─────────────────────────────────────────────────────────────────────────────

export interface ClaimsFilters {
  status: ClaimStatus | '';
  dateRange: { from: string; to: string } | null;
  agent: string;
  disruptionType: string;
  search: string;
}

const defaultFilters: ClaimsFilters = {
  status: '',
  dateRange: null,
  agent: '',
  disruptionType: '',
  search: '',
};

// ─────────────────────────────────────────────────────────────────────────────
// Store interface
// ─────────────────────────────────────────────────────────────────────────────

interface ClaimsStore {
  claims: Claim[];
  selectedClaim: Claim | null;
  filters: ClaimsFilters;

  // Basic setters
  setClaims: (claims: Claim[]) => void;
  setSelectedClaim: (claim: Claim | null) => void;

  // Claim mutations
  updateClaimStatus: (claimId: string, newStatus: ClaimStatus) => void;
  assignClaim: (claimId: string, agentId: string) => void;
  approveClaim: (claimId: string) => void;
  rejectClaim: (claimId: string, reason: string) => void;
  returnClaim: (claimId: string, reason: string) => void;

  // Filters
  setFilters: (filters: Partial<ClaimsFilters>) => void;
  clearFilters: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper — update a single claim by id and keep selectedClaim in sync
// ─────────────────────────────────────────────────────────────────────────────

function patchClaim(
  claims: Claim[],
  selectedClaim: Claim | null,
  claimId: string,
  patch: Partial<Claim>,
): { claims: Claim[]; selectedClaim: Claim | null } {
  const now = new Date().toISOString();
  const updated = claims.map((c) =>
    c.id === claimId ? { ...c, ...patch, updatedAt: now } : c,
  );
  const newSelected =
    selectedClaim?.id === claimId
      ? { ...selectedClaim, ...patch, updatedAt: now }
      : selectedClaim;
  return { claims: updated, selectedClaim: newSelected };
}

// ─────────────────────────────────────────────────────────────────────────────
// Store
// ─────────────────────────────────────────────────────────────────────────────

export const useClaimsStore = create<ClaimsStore>((set, get) => ({
  claims: mockClaims,
  selectedClaim: null,
  filters: defaultFilters,

  setClaims: (claims) => set({ claims }),

  setSelectedClaim: (claim) => set({ selectedClaim: claim }),

  updateClaimStatus: (claimId, newStatus) => {
    const { claims, selectedClaim } = get();
    set(patchClaim(claims, selectedClaim, claimId, { status: newStatus }));
  },

  assignClaim: (claimId, agentId) => {
    const { claims, selectedClaim } = get();
    set(
      patchClaim(claims, selectedClaim, claimId, {
        assignedAgentId: agentId,
        status: 'assigned',
      }),
    );
  },

  approveClaim: (claimId) => {
    const { claims, selectedClaim } = get();
    set(
      patchClaim(claims, selectedClaim, claimId, {
        status: 'approved',
        outcome: 'approve_full',
      }),
    );
  },

  rejectClaim: (claimId, reason) => {
    const { claims, selectedClaim } = get();
    set(
      patchClaim(claims, selectedClaim, claimId, {
        status: 'rejected',
        outcome: 'reject',
        authorizationNotes: reason,
      }),
    );
  },

  returnClaim: (claimId, reason) => {
    const { claims, selectedClaim } = get();
    set(
      patchClaim(claims, selectedClaim, claimId, {
        status: 'returned',
        returnedReason: reason,
      }),
    );
  },

  setFilters: (partial) =>
    set((state) => ({ filters: { ...state.filters, ...partial } })),

  clearFilters: () => set({ filters: defaultFilters }),
}));
