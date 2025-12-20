export const triggerHaptic = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(10); // 10ms "tick" for light tactile feedback
    }
};
