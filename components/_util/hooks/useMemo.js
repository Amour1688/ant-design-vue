import { reactive } from '@vue/composition-api';

export default function useMemo(getValue, condition, shouldUpdate) {
  const cacheRef = reactive({ value: null, condition: null });

  if (!('value' in cacheRef) || shouldUpdate(cacheRef.condition, condition)) {
    cacheRef.value = getValue();
    cacheRef.condition = condition;
  }

  return cacheRef.value;
}
