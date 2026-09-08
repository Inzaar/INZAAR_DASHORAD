import { useEffect, useState } from 'react';
import { useBlocker } from 'react-router-dom';

/**
 * Hook to warn users if they have unsaved changes before leaving the page.
 * Uses both window.beforeunload for external navigation/refresh and React Router's useBlocker for internal navigation.
 * 
 * @param {boolean} isDirty - True if there are unsaved changes
 * @returns {object} { blocker, showModal, proceedNavigation, cancelNavigation }
 */
export const useWarnIfUnsavedChanges = (isDirty) => {
    // 1. Browser Event (Refresh, Close Tab, URL Change)
    useEffect(() => {
        const handleBeforeUnload = (event) => {
            if (isDirty) {
                event.preventDefault();
                event.returnValue = ''; // Standard requirement for browsers to show prompt
                return '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty]);

    // 2. React Router internal navigation blocker
    // useBlocker works only in data routers (createBrowserRouter)
    const blocker = useBlocker(
        ({ currentLocation, nextLocation }) =>
            isDirty && currentLocation.pathname !== nextLocation.pathname
    );

    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        if (blocker.state === 'blocked') {
            setShowModal(true);
        }
    }, [blocker.state]);

    const proceedNavigation = () => {
        setShowModal(false);
        if (blocker.state === 'blocked') {
            blocker.proceed();
        }
    };

    const cancelNavigation = () => {
        setShowModal(false);
        if (blocker.state === 'blocked') {
            blocker.reset();
        }
    };

    return {
        blocker,
        showModal,
        proceedNavigation,
        cancelNavigation
    };
};
