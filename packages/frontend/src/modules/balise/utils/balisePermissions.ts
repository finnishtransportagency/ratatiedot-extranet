import { BaliseWithHistory } from '../types/baliseTypes';
import type { BalisePermissions } from '../services/BalisePermissionsService';

export const canDeleteBalise = (
  balise: Pick<BaliseWithHistory, 'locked'>,
  permissions?: Pick<BalisePermissions, 'canDelete' | 'canDeleteLocked'> | null,
): boolean => !!permissions?.canDelete && (!balise.locked || !!permissions.canDeleteLocked);

export const canUnlockBalises = (
  balises: BaliseWithHistory[],
  currentUserUid?: string | undefined | null,
  canUnlockOthers?: boolean,
): boolean => {
  if (!balises.length) return false;
  // Admins and lite admins can unlock any locked balise
  if (canUnlockOthers) {
    return balises.every((b) => b.locked);
  }
  if (!currentUserUid) return false;
  return balises.every((b) => b.locked && b.lockedBy === currentUserUid);
};
