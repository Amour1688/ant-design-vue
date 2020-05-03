import { ref } from '@vue/composition-api';

export default function useControlledState(defaultStateValue, option) {
  const { defaultValue, value, onChange, postState } = option || {};
  const innerValue = ref(() => {
    if (value !== undefined) {
      return value;
    }
    if (defaultValue !== undefined) {
      return typeof defaultValue === 'function' ? defaultValue() : defaultValue;
    }
    return typeof defaultStateValue === 'function' ? defaultStateValue() : defaultStateValue;
  });

  let mergedValue = value !== undefined ? value : innerValue;
  if (postState) {
    mergedValue = postState(mergedValue);
  }

  function triggerChange(newValue) {
    innerValue.value = newValue;
    if (mergedValue !== newValue && onChange) {
      onChange(newValue, mergedValue);
    }
  }

  return [mergedValue, triggerChange];
}
