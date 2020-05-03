import { ref, watch } from '@vue/composition-api';

export default function useDelayReset(timeout = 10) {
  const bool = ref(false);
  const delayRef = ref(null);

  const cancelLatest = () => {
    window.clearTimeout(delayRef.value);
  };

  watch(() => cancelLatest, []);

  const delaySetBool = (value, callback) => {
    cancelLatest();

    delayRef.value = window.setTimeout(() => {
      bool.value = value;
      if (callback) {
        callback();
      }
    }, timeout);
  };

  return [bool, delaySetBool, cancelLatest];
}
