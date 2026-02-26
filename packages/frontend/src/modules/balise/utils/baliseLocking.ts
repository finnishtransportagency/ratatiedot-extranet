import { BaliseWithHistory } from '../types/baliseTypes';

// Utility to check if the current user can unlock balises
export const canUnlockBalises = (
  balises: BaliseWithHistory[],
  currentUserUid?: string | undefined | null,
  isAdmin?: boolean,
): boolean => {
  if (!balises.length) return false;
  // Admins can unlock any locked balise
  if (isAdmin) {
    return balises.every((b) => b.locked);
  }
  if (!currentUserUid) return false;
  return balises.every((b) => b.locked && b.lockedBy === currentUserUid);
};
