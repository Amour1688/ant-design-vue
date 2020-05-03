import { ref, watchEffect } from '@vue/composition-api';
/**
 * Locker return cached mark.
 * If set to `true`, will return `true` in a short time even if set `false`.
 * If set to `false` and then set to `true`, will change to `true`.
 * And after time duration, it will back to `null` automatically.
 */
export default function useLock(duration = 250) {
  const lockRef = ref(null);
  const timeoutRef = ref(null);

  // Clean up
  watchEffect(() => () => {
    window.clearTimeout(timeoutRef.value);
  });

  function doLock(locked) {
    if (locked || lockRef.value === null) {
      lockRef.current = locked;
    }

    window.clearTimeout(timeoutRef.current);
    timeoutRef.value = window.setTimeout(() => {
      lockRef.value = null;
    }, duration);
  }

  return [() => lockRef.value, doLock];
}
