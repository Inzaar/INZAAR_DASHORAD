import React, { useEffect, useState } from 'react';
import { Outlet, useBlocker, useLocation } from 'react-router-dom';
import UnsavedChangesModal from './UnsavedChangesModal';

const GlobalUnsavedChangesTracker = () => {
    const [isDirty, setIsDirty] = useState(false);
    const location = useLocation();

    // Reset dirty state strictly when the route changes
    useEffect(() => {
        setIsDirty(false);
    }, [location.pathname]);

    useEffect(() => {
        const handleInput = (e) => {
            // Only track deliberate user interactions
            if (!e.isTrusted) return;

            const target = e.target;
            const tag = target.tagName?.toLowerCase();
            
            if (tag === 'input' || tag === 'textarea' || tag === 'select') {
                // Exclude specific input types
                if (target.type === 'submit' || target.type === 'button' || target.type === 'search') return;

                // Exclude elements with specific data attributes
                if (target.hasAttribute('data-no-warn') || target.hasAttribute('data-search')) return;

                // Check class, name, id, and placeholder for "search" or "filter" keywords
                const className = (target.className || '').toString().toLowerCase();
                const name = (target.name || '').toLowerCase();
                const id = (target.id || '').toLowerCase();
                const placeholder = (target.placeholder || '').toLowerCase();

                const isSearchOrFilter = ['search', 'filter'].some(keyword => 
                    className.includes(keyword) || 
                    name.includes(keyword) || 
                    id.includes(keyword) || 
                    placeholder.includes(keyword)
                );

                if (!isSearchOrFilter) {
                    setIsDirty(true);
                }
            }
        };

        const handleSubmit = () => {
            setIsDirty(false);
        };

        const handleClick = (e) => {
            const btn = e.target.closest('button');
            if (btn) {
                const type = btn.type;
                const text = btn.innerText?.toLowerCase().trim() || '';
                const ariaLabel = btn.getAttribute('aria-label')?.toLowerCase() || '';

                // If the button is explicitly a submit button, or has text indicating an action that shouldn't be blocked
                if (
                    type === 'submit' ||
                    ['save', 'submit', 'update', 'add', 'create', 'proceed', 'confirm'].some(k => text.includes(k) || ariaLabel.includes(k)) ||
                    ['cancel', 'close', 'discard'].some(k => text.includes(k) || ariaLabel.includes(k))
                ) {
                    setIsDirty(false);
                }
            }
        };

        const handleBeforeUnload = (e) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = ''; // Required for Chrome
                return '';
            }
        };

        // Capture phase listeners to ensure we catch the events before propagation might be stopped
        document.addEventListener('input', handleInput, true);
        document.addEventListener('change', handleInput, true);
        document.addEventListener('keyup', handleInput, true);
        document.addEventListener('submit', handleSubmit, true);
        document.addEventListener('click', handleClick, true);
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            document.removeEventListener('input', handleInput, true);
            document.removeEventListener('change', handleInput, true);
            document.removeEventListener('keyup', handleInput, true);
            document.removeEventListener('submit', handleSubmit, true);
            document.removeEventListener('click', handleClick, true);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [isDirty]);

    const blocker = useBlocker(
        ({ currentLocation, nextLocation }) =>
            isDirty === true && currentLocation.pathname !== nextLocation.pathname
    );

    const proceedNavigation = () => {
        setIsDirty(false);
        if (blocker.state === 'blocked') {
            blocker.proceed();
        }
    };

    const cancelNavigation = () => {
        if (blocker.state === 'blocked') {
            blocker.reset();
        }
    };

    return (
        <>
            <Outlet />
            <UnsavedChangesModal
                isOpen={blocker.state === 'blocked'}
                onProceed={proceedNavigation}
                onCancel={cancelNavigation}
            />
        </>
    );
};

export default GlobalUnsavedChangesTracker;
