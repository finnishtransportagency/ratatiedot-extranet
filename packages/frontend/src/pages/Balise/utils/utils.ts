import type { BaliseWithHistory } from '../types';

interface Permissions {
  isAdmin?: boolean;
  currentUserUid?: string;
}

/**
 * Determines which version of a balise to display based on user permissions
 * and version status. Returns the appropriate version for viewing/downloading.
 */
export const getDisplayVersion = (
  balise: BaliseWithHistory | null | undefined,
  permissions: Permissions | null | undefined,
): BaliseWithHistory | null => {
  if (!balise) return null;

  const canSeeDrafts = permissions?.isAdmin || balise.lockedBy === permissions?.currentUserUid;

  // If user can see drafts or the balise is official, show the current version
  if (canSeeDrafts || balise.versionStatus === 'OFFICIAL') {
    return balise;
  }

  // Otherwise, find the version that was locked (latest official)
  if (balise.lockedAtVersion) {
    const lockedVersion = balise.history?.find((v) => v.version === balise.lockedAtVersion);
    if (lockedVersion) {
      return { ...lockedVersion, history: balise.history } as BaliseWithHistory;
    }
  }

  // This should never happen - UNCONFIRMED balise should always have lockedAtVersion
  console.error('Data integrity issue: UNCONFIRMED balise missing lockedAtVersion', {
    baliseId: balise.id,
    secondaryId: balise.secondaryId,
    versionStatus: balise.versionStatus,
  });
  return null;
};

/**
 * Checks if a user can see draft versions based on permissions
 */
export const canSeeDrafts = (
  balise: BaliseWithHistory | null | undefined,
  permissions: Permissions | null | undefined,
): boolean => {
  return permissions?.isAdmin || (balise && balise.lockedBy === permissions?.currentUserUid) || false;
};
