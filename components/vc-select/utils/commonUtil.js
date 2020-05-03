export function toArray(value) {
  if (Array.isArray(value)) {
    return value;
  }
  return value !== undefined ? [value] : [];
}

/**
 * Convert outer props value into internal value
 */
export function toInnerValue(value, { labelInValue, combobox }) {
  if (value === undefined || (value === '' && combobox)) {
    return [];
  }

  const values = Array.isArray(value) ? value : [value];

  if (labelInValue) {
    return values.map(({ key, value: val }) => (val !== undefined ? val : key));
  }

  return values;
}

/**
 * Convert internal value into out event value
 */
export function toOuterValues(
  valueList,
  { optionLabelProp, labelInValue, prevValue, options, getLabeledValue },
) {
  let values = valueList;

  if (labelInValue) {
    values = values.map(val =>
      getLabeledValue(val, {
        options,
        prevValue,
        labelInValue,
        optionLabelProp,
      }),
    );
  }

  return values;
}

export function removeLastEnabledValue(measureValues, values) {
  const newValues = [...values];

  let removeIndex;
  for (removeIndex = measureValues.length - 1; removeIndex >= 0; removeIndex -= 1) {
    if (!measureValues[removeIndex].disabled) {
      break;
    }
  }

  let removedValue = null;

  if (removeIndex !== -1) {
    removedValue = newValues[removeIndex];
    newValues.splice(removeIndex, 1);
  }

  return {
    values: newValues,
    removedValue,
  };
}

export const isClient =
  typeof window !== 'undefined' && window.document && window.document.documentElement;

/** Is client side and not jsdom */
export const isBrowserClient = process.env.NODE_ENV !== 'test' && isClient;

let uuid = 0;
/** Get unique id for accessibility usage */
export function getUUID() {
  let retId;

  // Test never reach
  /* istanbul ignore if */
  if (isBrowserClient) {
    retId = uuid;
    uuid += 1;
  } else {
    retId = 'TEST_OR_SSR';
  }

  return retId;
}
