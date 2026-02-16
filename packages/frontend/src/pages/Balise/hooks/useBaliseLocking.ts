import { useState, useCallback } from 'react';
import { useBaliseStore } from '../../../store/baliseStore';
import type { BaliseWithHistory } from '../types';

interface UseBaliseLockingOptions {
  onSuccess?: (secondaryId: number) => Promise<void> | void;
  onError?: (error: string, errorType?: 'locked' | 'already_locked' | 'error') => void;
}

interface UseBaliseLockingReturn {
  // Dialog states
  lockDialogOpen: boolean;
  unlockDialogOpen: boolean;
  baliseToLock: BaliseWithHistory | null;
  baliseToUnlock: BaliseWithHistory | null;

  // Loading state
  isLocking: boolean;
  lockingBaliseId: string | null;

  // Handlers
  handleLockToggle: (balise: BaliseWithHistory) => void;
  handleLockConfirm: (lockReason: string) => Promise<void>;
  handleUnlockConfirm: () => Promise<void>;
  handleLockCancel: () => void;
  handleUnlockCancel: () => void;
}

/**
 * Custom hook for managing balise lock/unlock operations.
 * Provides dialog state management and handlers for locking/unlocking balises.
 */
export const useBaliseLocking = (options: UseBaliseLockingOptions = {}): UseBaliseLockingReturn => {
  const { onSuccess, onError } = options;
  const { lockBalise, unlockBalise } = useBaliseStore();

  const [lockDialogOpen, setLockDialogOpen] = useState(false);
  const [unlockDialogOpen, setUnlockDialogOpen] = useState(false);
  const [baliseToLock, setBaliseToLock] = useState<BaliseWithHistory | null>(null);
  const [baliseToUnlock, setBaliseToUnlock] = useState<BaliseWithHistory | null>(null);
  const [isLocking, setIsLocking] = useState(false);
  const [lockingBaliseId, setLockingBaliseId] = useState<string | null>(null);

  const handleError = useCallback(
    (err: unknown, fallbackMessage: string) => {
      if (!onError) return;

      if (!(err instanceof Error)) {
        onError(fallbackMessage, 'error');
        return;
      }

      try {
        const errorData = JSON.parse(err.message);
        const message = errorData.error || errorData.message || err.message;
        onError(message, errorData.errorType || 'error');
      } catch {
        onError(err.message, 'error');
      }
    },
    [onError],
  );

  const handleLockToggle = useCallback(
    (balise: BaliseWithHistory) => {
      // If unlocking and version has changed, show confirmation dialog
      if (balise.locked && balise.lockedAtVersion && balise.version > balise.lockedAtVersion) {
        setBaliseToUnlock(balise);
        setUnlockDialogOpen(true);
        return;
      }

      // If locking, show lock reason dialog
      if (!balise.locked) {
        setBaliseToLock(balise);
        setLockDialogOpen(true);
        return;
      }

      // Unlocking (no version change) - do it directly
      const secondaryId = balise.secondaryId;
      setIsLocking(true);
      setLockingBaliseId(balise.id);
      unlockBalise(secondaryId)
        .then(() => onSuccess?.(secondaryId))
        .catch((err) => handleError(err, 'Lukituksen avaaminen epäonnistui'))
        .finally(() => {
          setIsLocking(false);
          setLockingBaliseId(null);
        });
    },
    [unlockBalise, onSuccess, handleError],
  );

  const handleLockConfirm = useCallback(
    async (lockReason: string) => {
      if (!baliseToLock) return;

      const target = baliseToLock;
      setLockDialogOpen(false);
      setBaliseToLock(null);
      setIsLocking(true);
      setLockingBaliseId(target.id);

      try {
        await lockBalise(target.secondaryId, lockReason);
        await onSuccess?.(target.secondaryId);
      } catch (err) {
        handleError(err, 'Lukitus epäonnistui');
      } finally {
        setIsLocking(false);
        setLockingBaliseId(null);
      }
    },
    [baliseToLock, lockBalise, onSuccess, handleError],
  );

  const handleUnlockConfirm = useCallback(async () => {
    if (!baliseToUnlock) return;

    const target = baliseToUnlock;
    setUnlockDialogOpen(false);
    setBaliseToUnlock(null);
    setIsLocking(true);
    setLockingBaliseId(target.id);

    try {
      await unlockBalise(target.secondaryId);
      await onSuccess?.(target.secondaryId);
    } catch (err) {
      handleError(err, 'Lukituksen avaaminen epäonnistui');
    } finally {
      setIsLocking(false);
      setLockingBaliseId(null);
    }
  }, [baliseToUnlock, unlockBalise, onSuccess, handleError]);

  const handleLockCancel = useCallback(() => {
    setLockDialogOpen(false);
    setBaliseToLock(null);
  }, []);

  const handleUnlockCancel = useCallback(() => {
    setUnlockDialogOpen(false);
    setBaliseToUnlock(null);
  }, []);

  return {
    lockDialogOpen,
    unlockDialogOpen,
    baliseToLock,
    baliseToUnlock,
    isLocking,
    lockingBaliseId,
    handleLockToggle,
    handleLockConfirm,
    handleUnlockConfirm,
    handleLockCancel,
    handleUnlockCancel,
  };
};
