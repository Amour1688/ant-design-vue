/**
 * To match accessibility requirement, we always provide an input in the component.
 * Other element will not set `tabIndex` to avoid `onBlur` sequence problem.
 * For focused select, we set `aria-live="polite"` to update the accessibility content.
 *
 * ref:
 * - keyboard: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/listbox_role#Keyboard_interactions
 *
 * New api:
 * - listHeight
 * - listItemHeight
 * - component
 *
 * Remove deprecated api:
 * - multiple
 * - tags
 * - combobox
 * - firstActiveValue
 * - dropdownMenuStyle
 * - openClassName (Not list in api)
 *
 * Update:
 * - `backfill` only support `combobox` mode
 * - `combobox` mode not support `labelInValue` since it's meaningless
 * - `getInputElement` only support `combobox` mode
 * - `onChange` return OptionData instead of ReactNode
 * - `filterOption` `onChange` `onSelect` accept OptionData instead of ReactNode
 * - `combobox` mode trigger `onChange` will get `undefined` if no `value` match in Option
 * - `combobox` mode not support `optionLabelProp`
 */
import SelectOptionList from './OptionList';
import { convertChildrenToData as convertSelectChildrenToData } from './utils/legacyUtil';
import {
  getLabeledValue as getSelectLabeledValue,
  filterOptions as selectDefaultFilterOptions,
  isValueDisabled as isSelectValueDisabled,
  findValueOption as findSelectValueOption,
  flattenOptions,
  fillOptionsWithMissingValue,
} from './utils/valueUtil';
import { SelectPropTypes } from './PropTypes';
import { getOptionProps } from '../_util/props-util';
import generateSelector from './generate';
import warningProps from './utils/warningPropsUtil';

const RefSelect = generateSelector({
  prefixCls: 'vc-select',
  components: {
    optionList: SelectOptionList,
  },
  convertChildrenToData: convertSelectChildrenToData,
  flattenOptions,
  getLabeledValue: getSelectLabeledValue,
  filterOptions: selectDefaultFilterOptions,
  isValueDisabled: isSelectValueDisabled,
  findValueOption: findSelectValueOption,
  warningProps,
  fillOptionsWithMissingValue,
});

export default {
  name: 'Select',
  inheritAttrs: false,
  props: {
    ...SelectPropTypes,
  },
  // setup(props) {
  //   return () => <RefSelect ref="selectRef" {...props} />;
  // },
  methods: {
    focus() {
      this.$refs.selectRef.focus();
    },
    blur() {
      this.$refs.selectRef.blur();
    },
  },
  render() {
    return <RefSelect ref="selectRef" {...getOptionProps(this)} />;
  },
};
