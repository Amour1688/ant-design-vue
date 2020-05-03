import omit from 'omit.js';
import classNames from 'classnames';
import VcSelect, { Option, OptGroup, SelectPropTypes } from '../vc-select';
import { ConfigConsumerProps } from '../config-provider';
import getIcons from './utils/iconUtil';
import { getOptionProps } from '../_util/props-util';
import PropTypes from '../_util/vue-types';
import Base from '../base';

const SECRET_COMBOBOX_MODE_DO_NOT_USE = 'SECRET_COMBOBOX_MODE_DO_NOT_USE';

const AbstractSelectProps = () => ({
  prefixCls: PropTypes.string,
  size: PropTypes.oneOf(['small', 'large', 'default']),
  showAction: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(String)]),
  notFoundContent: PropTypes.any,
  transitionName: PropTypes.string,
  choiceTransitionName: PropTypes.string,
  showSearch: PropTypes.bool,
  allowClear: PropTypes.bool,
  disabled: PropTypes.bool,
  tabIndex: PropTypes.number,
  placeholder: PropTypes.any,
  defaultActiveFirstOption: PropTypes.bool,
  dropdownClassName: PropTypes.string,
  dropdownStyle: PropTypes.any,
  dropdownMenuStyle: PropTypes.any,
  dropdownMatchSelectWidth: PropTypes.bool,
  // onSearch: (value: string) => any,
  filterOption: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
  autoFocus: PropTypes.bool,
  backfill: PropTypes.bool,
  showArrow: PropTypes.bool,
  getPopupContainer: PropTypes.func,
  open: PropTypes.bool,
  defaultOpen: PropTypes.bool,
  autoClearSearchValue: PropTypes.bool,
  dropdownRender: PropTypes.func,
  loading: PropTypes.bool,
});
const Value = PropTypes.shape({
  key: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
}).loose;

const SelectValue = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.number,
  PropTypes.arrayOf(PropTypes.oneOfType([Value, PropTypes.string, PropTypes.number])),
  Value,
]);

const SelectProps = {
  ...AbstractSelectProps(),
  value: SelectValue,
  defaultValue: SelectValue,
  // mode: PropTypes.oneOf(['default', 'multiple', 'tags', 'combobox']),
  mode: PropTypes.string,
  optionLabelProp: PropTypes.string,
  firstActiveValue: PropTypes.oneOfType([String, PropTypes.arrayOf(String)]),
  maxTagCount: PropTypes.number,
  maxTagPlaceholder: PropTypes.any,
  maxTagTextLength: PropTypes.number,
  dropdownMatchSelectWidth: PropTypes.bool,
  optionFilterProp: PropTypes.string,
  labelInValue: PropTypes.boolean,
  getPopupContainer: PropTypes.func,
  tokenSeparators: PropTypes.arrayOf(PropTypes.string),
  getInputElement: PropTypes.func,
  options: PropTypes.array,
  suffixIcon: PropTypes.any,
  removeIcon: PropTypes.any,
  clearIcon: PropTypes.any,
  menuItemSelectedIcon: PropTypes.any,
};

// const SelectPropTypes = {
//   prefixCls: PropTypes.string,
//   size: PropTypes.oneOf(['default', 'large', 'small']),
//   // combobox: PropTypes.bool,
//   notFoundContent: PropTypes.any,
//   showSearch: PropTypes.bool,
//   optionLabelProp: PropTypes.string,
//   transitionName: PropTypes.string,
//   choiceTransitionName: PropTypes.string,
// };

export { AbstractSelectProps, SelectValue, SelectProps };

const Select = {
  name: 'ASelect',
  SECRET_COMBOBOX_MODE_DO_NOT_USE,
  Option: { ...Option, name: 'ASelectOption' },
  OptGroup: { ...OptGroup, name: 'ASelectOptGroup' },
  props: {
    ...SelectPropTypes,
    showSearch: PropTypes.bool.def(false),
    transitionName: PropTypes.string.def('slide-up'),
    choiceTransitionName: PropTypes.string.def('zoom'),
  },
  SelectPropTypes,
  inject: {
    configProvider: { default: () => ConfigConsumerProps },
  },
  methods: {
    focus() {
      if (this.$refs.selectRef) {
        this.$refs.selectRef.focus();
      }
    },
    blur() {
      if (this.$refs.selectRef) {
        this.$refs.selectRef.blur();
      }
    },
    getMode() {
      const { mode } = this.$props;

      if (mode === 'combobox') {
        return undefined;
      }

      if (mode === SECRET_COMBOBOX_MODE_DO_NOT_USE) {
        return 'combobox';
      }

      return mode;
    },
  },
  render(h) {
    const props = getOptionProps(this);
    const {
      prefixCls: customizePrefixCls,
      notFoundContent,
      className,
      size: customizeSize,
      listHeight = 256,
      listItemHeight = 32,
      getPopupContainer,
      dropdownClassName,
      bordered,
    } = props;

    const { getPrefixCls, renderEmpty, direction } = this.configProvider;

    const prefixCls = getPrefixCls('select', customizePrefixCls);
    const mode = this.getMode();

    const isMultiple = mode === 'multiple' || mode === 'tags';

    // ===================== Empty =====================
    let mergedNotFound;
    if (notFoundContent !== undefined) {
      mergedNotFound = notFoundContent;
    } else if (mode === 'combobox') {
      mergedNotFound = null;
    } else {
      mergedNotFound = renderEmpty(h, 'Select');
    }

    // ===================== Icons =====================
    const { suffixIcon, itemIcon, removeIcon, clearIcon } = getIcons({
      h,
      ...props,
      multiple: isMultiple,
    });

    const selectProps = omit(props, [
      'prefixCls',
      'suffixIcon',
      'itemIcon',
      'removeIcon',
      'clearIcon',
      'size',
      'bordered',
    ]);

    const vcSelectRtlDropDownClassName = classNames(dropdownClassName, {
      [`${prefixCls}-dropdown-${direction}`]: direction === 'rtl',
    });

    const mergedSize = customizeSize;

    const mergedClassName = classNames(className, {
      [`${prefixCls}-lg`]: mergedSize === 'large',
      [`${prefixCls}-sm`]: mergedSize === 'small',
      [`${prefixCls}-rtl`]: direction === 'rtl',
      [`${prefixCls}-borderless`]: !bordered,
    });

    return (
      <VcSelect
        ref="selectRef"
        {...selectProps}
        listHeight={listHeight}
        listItemHeight={listItemHeight}
        mode={mode}
        prefixCls={prefixCls}
        direction={direction}
        inputIcon={suffixIcon}
        menuItemSelectedIcon={itemIcon}
        removeIcon={removeIcon}
        clearIcon={clearIcon}
        notFoundContent={mergedNotFound}
        className={mergedClassName}
        getPopupContainer={getPopupContainer}
        dropdownClassName={vcSelectRtlDropDownClassName}
      />
    );
  },
};

/* istanbul ignore next */
Select.install = function(Vue) {
  Vue.use(Base);
  Vue.component(Select.name, Select);
  Vue.component(Select.Option.name, Select.Option);
  Vue.component(Select.OptGroup.name, Select.OptGroup);
};

export default Select;
