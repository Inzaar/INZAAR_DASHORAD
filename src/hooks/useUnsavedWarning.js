import { useEffect, useState, useCallback, useRef } from 'react';
import { useBlocker } from 'react-router-dom';

export const useUnsavedWarning = (isDirty, onDiscard, options = {}) => {
  const [showModal, setShowModal] = useState(false);
  const [isClosingModal, setIsClosingModal] = useState(false);
  const { isOpen = false } = options;

  const onDiscardRef = useRef(onDiscard);
  useEffect(() => {
    onDiscardRef.current = onDiscard;
  }, [onDiscard]);

  // 1. Browser Tab Close / Page Refresh Handling
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // 2. React Router In-App Navigation Blocker
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      Boolean(isDirty) && currentLocation.pathname !== nextLocation.pathname
  );

  useEffect(() => {
    if (blocker.state === 'blocked') {
      setIsClosingModal(false);
      setShowModal(true);
    }
  }, [blocker.state]);

  // 3. Safe close handler for "Cancel", "x" icon, backdrop click, ESC
  const handleAttemptClose = useCallback((customDiscard) => {
    if (isDirty) {
      setIsClosingModal(true);
      setShowModal(true);
    } else {
      if (typeof customDiscard === 'function') {
        customDiscard();
      } else if (typeof onDiscardRef.current === 'function') {
        onDiscardRef.current();
      }
    }
  }, [isDirty]);

  // 4. ESC Key Listener for Modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (!showModal) {
          handleAttemptClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, showModal, handleAttemptClose]);

  const handleLeave = () => {
    setShowModal(false);
    if (blocker.state === 'blocked') {
      blocker.proceed();
    }
    if (isClosingModal) {
      setIsClosingModal(false);
      if (typeof onDiscardRef.current === 'function') {
        onDiscardRef.current();
      }
    }
  };

  const handleStay = () => {
    setShowModal(false);
    setIsClosingModal(false);
    if (blocker.state === 'blocked') {
      blocker.reset();
    }
  };

  return {
    showModal,
    handleLeave,
    handleStay,
    setShowModal,
    handleAttemptClose,
    isClosingModal
  };
};

