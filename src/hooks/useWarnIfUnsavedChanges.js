/**
 * Hook to warn users if they have unsaved changes (Disabled).
 */
export const useWarnIfUnsavedChanges = () => {
    return {
        blocker: { state: 'unblocked' },
        showModal: false,
        proceedNavigation: () => {},
        cancelNavigation: () => {}
    };
};
