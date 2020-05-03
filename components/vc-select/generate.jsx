import { ref, watch, computed, watchEffect, defineComponent } from '@vue/composition-api';
import classNames from 'classnames';
import KeyCode from '../_util/KeyCode';
import { toInnerValue, toOuterValues, removeLastEnabledValue, getUUID } from './utils/commonUtil';
import useMergedState from '../_util/hooks/useMergedState';
import useDelayReset from './hooks/useDelayReset';
import useLock from './hooks/useLock';
import { getSeparatedContent } from './utils/valueUtil';
import useSelectTriggerControl from './hooks/useSelectTriggerControl';

const INTERNAL_PROPS_MARK = 'VC_SELECT_INTERNAL_PROPS_MARK';

const DEFAULT_OMIT_PROPS = [
  'removeIcon',
  'placeholder',
  'autoFocus',
  'maxTagCount',
  'maxTagTextLength',
  'maxTagPlaceholder',
  'choiceTransitionName',
  'onInputKeyDown',
];

/**
 * This function is in internal usage.
 * Do not use it in your prod env since we may refactor this.
 */
export default function generateSelector(config) {
  const {
    prefixCls: defaultPrefixCls,
    components: { optionList: OptionList },
    convertChildrenToData,
    flattenOptions,
    getLabeledValue,
    filterOptions,
    isValueDisabled,
    findValueOption,
    warningProps,
    fillOptionsWithMissingValue,
    omitDOMProps,
  } = config;

  // Use raw define since `React.FC` not support generic
  // function Select(
  //   props,
  //   // ref,
  // ) {

  // }

  const Select = defineComponent({
    setup(props) {
      const {
        prefixCls = defaultPrefixCls,
        className,
        id,

        open,
        defaultOpen,
        options,
        children,

        mode,
        value,
        defaultValue,
        labelInValue,

        // Search related
        showSearch,
        inputValue,
        searchValue,
        filterOption,
        optionFilterProp = 'value',
        autoClearSearchValue = true,
        onSearch,

        // Icons
        allowClear,
        clearIcon,
        showArrow,
        inputIcon,
        menuItemSelectedIcon,

        // Others
        disabled,
        loading,
        defaultActiveFirstOption,
        notFoundContent = 'Not Found',
        optionLabelProp,
        backfill,
        getInputElement,
        getPopupContainer,

        // Dropdown
        listHeight = 200,
        listItemHeight = 20,
        animation,
        transitionName,
        virtual,
        dropdownStyle,
        dropdownClassName,
        dropdownMatchSelectWidth,
        dropdownRender,
        dropdownAlign,
        showAction = [],
        direction,

        // Tags
        tokenSeparators,
        tagRender,

        // Events
        onPopupScroll,
        onDropdownVisibleChange,
        onFocus,
        onBlur,
        onKeyUp,
        onKeyDown,
        onMouseDown,

        onChange,
        onSelect,
        onDeselect,

        internalProps = {},

        ...restProps
      } = props;

      const useInternalProps = internalProps.mark === INTERNAL_PROPS_MARK;

      const domProps = omitDOMProps ? omitDOMProps(restProps) : restProps;
      DEFAULT_OMIT_PROPS.forEach(prop => {
        delete domProps[prop];
      });

      const containerRef = ref(null);
      const triggerRef = ref(null);
      const selectorRef = ref(null);
      const listRef = ref(null);

      /** Used for component focused management */
      const [mockFocused, setMockFocused, cancelSetMockFocused] = useDelayReset();

      // Inner id for accessibility usage. Only work in client side
      const innerId = ref();
      watch(() => {
        innerId.value = `vc_select_${getUUID()}`;
      }, []);
      const mergedId = id || innerId;

      // optionLabelProp
      let mergedOptionLabelProp = optionLabelProp;
      if (mergedOptionLabelProp === undefined) {
        mergedOptionLabelProp = options ? 'label' : 'children';
      }

      // labelInValue
      const mergedLabelInValue = mode === 'combobox' ? false : labelInValue;

      const isMultiple = mode === 'tags' || mode === 'multiple';

      const mergedShowSearch =
        showSearch !== undefined ? showSearch : isMultiple || mode === 'combobox';

      // ============================== Ref ===============================
      const selectorDomRef = ref(null);

      // React.useImperativeHandle(ref, () => ({
      //   focus: selectorRef.current.focus,
      //   blur: selectorRef.current.blur,
      // }));

      // ============================= Value ==============================
      const innerValue = ref(value || defaultValue);
      const baseValue = value !== undefined ? value : innerValue;

      // Should reset when controlled to be uncontrolled
      const prevValueRef = ref(value);
      watchEffect(() => {
        if (prevValueRef.value !== value && (value === undefined || value === null)) {
          innerValue.value = undefined;
        }
        prevValueRef.value = value;
      });

      /** Unique raw values */
      const mergedRawValue = toInnerValue(baseValue, {
        labelInValue: mergedLabelInValue,
        combobox: mode === 'combobox',
      });
      /** We cache a set of raw values to speed up check */
      const rawValues = new Set(mergedRawValue);

      // ============================= Option =============================
      // Set by option list active, it will merge into search input when mode is `combobox`
      const [activeValue, setActiveValue] = ref(null);
      const [innerSearchValue, setInnerSearchValue] = ref('');
      let mergedSearchValue = innerSearchValue;
      if (mode === 'combobox' && value !== undefined) {
        mergedSearchValue = value;
      } else if (searchValue !== undefined) {
        mergedSearchValue = searchValue;
      } else if (inputValue) {
        mergedSearchValue = inputValue;
      }

      const mergedOptions = computed(() => {
        let newOptions = options;
        if (newOptions === undefined) {
          newOptions = convertChildrenToData(children);
        }

        /**
         * `tags` should fill un-list item.
         * This is not cool here since TreeSelect do not need this
         */
        if (mode === 'tags' && fillOptionsWithMissingValue) {
          newOptions = fillOptionsWithMissingValue(
            newOptions,
            baseValue,
            mergedOptionLabelProp,
            labelInValue,
          );
        }

        return newOptions;
      }).value;

      const mergedFlattenOptions = flattenOptions(mergedOptions, props);

      // Display options for OptionList
      const displayOptions = computed(() => {
        if (!mergedSearchValue || !mergedShowSearch) {
          return [...mergedOptions];
        }
        const filteredOptions = filterOptions(mergedSearchValue, mergedOptions, {
          optionFilterProp,
          filterOption:
            mode === 'combobox' && filterOption === undefined ? () => true : filterOption,
        });
        if (mode === 'tags' && filteredOptions.every(opt => opt.value !== mergedSearchValue)) {
          filteredOptions.unshift({
            value: mergedSearchValue,
            label: mergedSearchValue,
            key: '__VC_SELECT_TAG_PLACEHOLDER__',
          });
        }

        return filteredOptions;
      }).value;

      const displayFlattenOptions = flattenOptions(displayOptions, props);

      watchEffect(() => {
        if (listRef.value && listRef.value.scrollTo) {
          listRef.value.scrollTo(0);
        }
      });

      // ============================ Selector ============================
      const displayValues = computed(() =>
        mergedRawValue.map(val => {
          const displayValue = getLabeledValue(val, {
            options: mergedFlattenOptions,
            prevValue: baseValue,
            labelInValue: mergedLabelInValue,
            optionLabelProp: mergedOptionLabelProp,
          });

          return {
            ...displayValue,
            disabled: isValueDisabled(val, mergedFlattenOptions),
          };
        }),
      ).value;

      const triggerSelect = (newValue, isSelect, source) => {
        const outOption = findValueOption([newValue], mergedFlattenOptions)[0];

        if (!internalProps.skipTriggerSelect) {
          // Skip trigger `onSelect` or `onDeselect` if configured
          const selectValue = mergedLabelInValue
            ? getLabeledValue(newValue, {
                options: mergedFlattenOptions,
                prevValue: baseValue,
                labelInValue: mergedLabelInValue,
                optionLabelProp: mergedOptionLabelProp,
              })
            : newValue;

          if (isSelect && onSelect) {
            onSelect(selectValue, outOption);
          } else if (!isSelect && onDeselect) {
            onDeselect(selectValue, outOption);
          }
        }

        // Trigger internal event
        if (useInternalProps) {
          if (isSelect && internalProps.onRawSelect) {
            internalProps.onRawSelect(newValue, outOption, source);
          } else if (!isSelect && internalProps.onRawDeselect) {
            internalProps.onRawDeselect(newValue, outOption, source);
          }
        }
      };

      const triggerChange = newRawValues => {
        if (useInternalProps && internalProps.skipTriggerChange) {
          return;
        }

        const outValues = toOuterValues(Array.from(newRawValues), {
          labelInValue: mergedLabelInValue,
          options: mergedFlattenOptions,
          getLabeledValue,
          prevValue: baseValue,
          optionLabelProp: mergedOptionLabelProp,
        });

        const outValue = isMultiple ? outValues : outValues[0];
        // Skip trigger if prev & current value is both empty
        if (onChange && (mergedRawValue.length !== 0 || outValues.length !== 0)) {
          const outOptions = findValueOption(newRawValues, mergedFlattenOptions);

          onChange(outValue, isMultiple ? outOptions : outOptions[0]);
        }
        innerValue.value = outValue;
      };

      const onInternalSelect = (newValue, { selected, source }) => {
        if (disabled) {
          return;
        }

        let newRawValue;

        if (isMultiple) {
          newRawValue = new Set(mergedRawValue);
          if (selected) {
            newRawValue.add(newValue);
          } else {
            newRawValue.delete(newValue);
          }
        } else {
          newRawValue = new Set();
          newRawValue.add(newValue);
        }

        // Multiple always trigger change and single should change if value changed
        if (isMultiple || (!isMultiple && Array.from(mergedRawValue)[0] !== newValue)) {
          triggerChange(Array.from(newRawValue));
        }

        // Trigger `onSelect`. Single mode always trigger select
        triggerSelect(newValue, !isMultiple || selected, source);

        // Clean search value if single or configured
        if (mode === 'combobox') {
          setInnerSearchValue(String(newValue));
          setActiveValue('');
        } else if (!isMultiple || autoClearSearchValue) {
          setInnerSearchValue('');
          setActiveValue('');
        }
      };

      const onInternalOptionSelect = (newValue, info) => {
        onInternalSelect(newValue, { ...info, source: 'option' });
      };

      const onInternalSelectionSelect = (newValue, info) => {
        onInternalSelect(newValue, { ...info, source: 'selection' });
      };

      // ============================= Input ==============================
      // Only works in `combobox`
      const customizeInputElement =
        (mode === 'combobox' && getInputElement && getInputElement()) || null;

      // ============================== Open ==============================
      const [innerOpen, setInnerOpen] = useMergedState(undefined, {
        defaultValue: defaultOpen,
        value: open,
      });

      let mergedOpen = innerOpen;

      // Not trigger `open` in `combobox` when `notFoundContent` is empty
      const emptyListContent = !notFoundContent && !displayOptions.length;
      if (disabled || (emptyListContent && mergedOpen && mode === 'combobox')) {
        mergedOpen = false;
      }
      const triggerOpen = emptyListContent ? false : mergedOpen;

      const onToggleOpen = newOpen => {
        const nextOpen = newOpen !== undefined ? newOpen : !mergedOpen;

        if (innerOpen !== nextOpen && !disabled) {
          setInnerOpen(nextOpen);

          if (onDropdownVisibleChange) {
            onDropdownVisibleChange(nextOpen);
          }
        }
      };

      useSelectTriggerControl(
        [containerRef.value, triggerRef.value && triggerRef.value.getPopupElement()],
        triggerOpen,
        onToggleOpen,
      );

      // ============================= Search =============================
      const triggerSearch = (searchText, fromTyping) => {
        let ret = true;
        let newSearchText = searchText;
        setActiveValue(null);

        // Check if match the `tokenSeparators`
        const patchLabels = getSeparatedContent(searchText, tokenSeparators);
        let patchRawValues = patchLabels;

        if (mode === 'combobox') {
          // Only typing will trigger onChange
          if (fromTyping) {
            triggerChange([newSearchText]);
          }
        } else if (patchLabels) {
          newSearchText = '';

          if (mode !== 'tags') {
            patchRawValues = patchLabels
              .map(label => {
                const item = mergedFlattenOptions.find(
                  ({ data }) => data[mergedOptionLabelProp] === label,
                );
                return item ? item.data.value : null;
              })
              .filter(val => val !== null);
          }

          const newRawValues = Array.from(new Set([...mergedRawValue, ...patchRawValues]));
          triggerChange(newRawValues);
          newRawValues.forEach(newRawValue => {
            triggerSelect(newRawValue, true, 'input');
          });

          // Should close when paste finish
          onToggleOpen(false);

          // Tell Selector that break next actions
          ret = false;
        }

        setInnerSearchValue(newSearchText);

        if (onSearch && mergedSearchValue !== newSearchText) {
          onSearch(newSearchText);
        }

        return ret;
      };

      // Close dropdown when disabled change
      watchEffect(() => {
        if (innerOpen && !!disabled) {
          setInnerOpen(false);
        }
      });

      // Close will clean up single mode search text
      watchEffect(() => {
        if (!mergedOpen && !isMultiple && mode !== 'combobox') {
          triggerSearch('', false);
        }
      });

      // ============================ Keyboard ============================
      /**
       * We record input value here to check if can press to clean up by backspace
       * - null: Key is not down, this is reset by key up
       * - true: Search text is empty when first time backspace down
       * - false: Search text is not empty when first time backspace down
       */
      const [getClearLock, setClearLock] = useLock();

      // KeyDown
      const onInternalKeyDown = (event, ...rest) => {
        const clearLock = getClearLock();
        const { which } = event;

        // We only manage open state here, close logic should handle by list component
        if (!mergedOpen && which === KeyCode.ENTER) {
          onToggleOpen(true);
        }

        setClearLock(!!mergedSearchValue);

        // Remove value by `backspace`
        if (
          which === KeyCode.BACKSPACE &&
          !clearLock &&
          isMultiple &&
          !mergedSearchValue &&
          mergedRawValue.length
        ) {
          const removeInfo = removeLastEnabledValue(displayValues, mergedRawValue);

          if (removeInfo.removedValue !== null) {
            triggerChange(removeInfo.values);
            triggerSelect(removeInfo.removedValue, false, 'input');
          }
        }

        if (mergedOpen && listRef.current) {
          listRef.current.onKeyDown(event, ...rest);
        }

        if (onKeyDown) {
          onKeyDown(event, ...rest);
        }
      };

      // KeyUp
      const onInternalKeyUp = (event, ...rest) => {
        if (mergedOpen && listRef.current) {
          listRef.current.onKeyUp(event, ...rest);
        }

        if (onKeyUp) {
          onKeyUp(event, ...rest);
        }
      };

      // ========================== Focus / Blur ==========================
      /** Record real focus status */
      const focusRef = ref(false);

      const onContainerFocus = (...args) => {
        setMockFocused(true);

        if (!disabled) {
          if (onFocus && !focusRef.value) {
            onFocus(...args);
          }

          // `showAction` should handle `focus` if set
          if (showAction.includes('focus')) {
            onToggleOpen(true);
          }
        }

        focusRef.value = true;
      };

      const onContainerBlur = (...args) => {
        setMockFocused(false, () => {
          focusRef.current = false;
          onToggleOpen(false);
        });

        if (disabled) {
          return;
        }

        if (mergedSearchValue) {
          // `tags` mode should move `searchValue` into values
          if (mode === 'tags') {
            triggerSearch('', false);
            triggerChange(Array.from(new Set([...mergedRawValue, mergedSearchValue])));
          } else if (mode === 'multiple') {
            // `multiple` mode only clean the search value but not trigger event
            setInnerSearchValue('');
          }
        }

        if (onBlur) {
          onBlur(...args);
        }
      };

      const activeTimeoutIds = [];
      watchEffect(() => () => {
        activeTimeoutIds.forEach(timeoutId => clearTimeout(timeoutId));
        activeTimeoutIds.splice(0, activeTimeoutIds.length);
      });

      const onInternalMouseDown = (event, ...restArgs) => {
        const { target } = event;
        const popupElement = triggerRef.value && triggerRef.value.getPopupElement();

        // We should give focus back to selector if clicked item is not focusable
        if (popupElement && popupElement.contains(target)) {
          const timeoutId = setTimeout(() => {
            const index = activeTimeoutIds.indexOf(timeoutId);
            if (index !== -1) {
              activeTimeoutIds.splice(index, 1);
            }

            cancelSetMockFocused();

            if (!popupElement.contains(document.activeElement)) {
              selectorRef.current.focus();
            }
          });

          activeTimeoutIds.push(timeoutId);
        }

        if (onMouseDown) {
          onMouseDown(event, ...restArgs);
        }
      };

      // ========================= Accessibility ==========================
      const [accessibilityIndex, setAccessibilityIndex] = ref(0);
      const mergedDefaultActiveFirstOption =
        defaultActiveFirstOption !== undefined ? defaultActiveFirstOption : mode !== 'combobox';

      const onActiveValue = (active, index) => {
        setAccessibilityIndex(index);

        if (backfill && mode === 'combobox' && active !== null) {
          setActiveValue(String(active));
        }
      };

      // ============================= Popup ==============================
      const containerWidth = ref(null);

      watchEffect(() => {
        if (triggerOpen) {
          const newWidth = Math.ceil(containerRef.current.offsetWidth);
          if (containerWidth !== newWidth) {
            containerWidth.value = newWidth;
          }
        }
      });

      const popupNode = (
        <OptionList
          ref={listRef}
          prefixCls={prefixCls}
          id={mergedId}
          open={mergedOpen}
          childrenAsData={!options}
          options={displayOptions}
          flattenOptions={displayFlattenOptions}
          multiple={isMultiple}
          values={rawValues}
          height={listHeight}
          itemHeight={listItemHeight}
          onSelect={onInternalOptionSelect}
          onToggleOpen={onToggleOpen}
          onActiveValue={onActiveValue}
          defaultActiveFirstOption={mergedDefaultActiveFirstOption}
          notFoundContent={notFoundContent}
          onScroll={onPopupScroll}
          searchValue={mergedSearchValue}
          menuItemSelectedIcon={menuItemSelectedIcon}
          virtual={virtual !== false && dropdownMatchSelectWidth !== false}
        />
      );

      // ============================= Clear ==============================
      let clearNode;
      const onClearMouseDown = () => {
        // Trigger internal `onClear` event
        if (useInternalProps && internalProps.onClear) {
          internalProps.onClear();
        }

        triggerChange([]);
        triggerSearch('', false);
      };

      if (!disabled && allowClear && (mergedRawValue.length || mergedSearchValue)) {
        clearNode = (
          <TransBtn
            className={`${prefixCls}-clear`}
            onMouseDown={onClearMouseDown}
            customizeIcon={clearIcon}
          >
            ×
          </TransBtn>
        );
      }

      // ============================= Arrow ==============================
      const mergedShowArrow =
        showArrow !== undefined ? showArrow : loading || (!isMultiple && mode !== 'combobox');
      let arrowNode;

      if (mergedShowArrow) {
        arrowNode = (
          <TransBtn
            className={classNames(`${prefixCls}-arrow`, {
              [`${prefixCls}-arrow-loading`]: loading,
            })}
            customizeIcon={inputIcon}
            customizeIconProps={{
              loading,
              searchValue: mergedSearchValue,
              open: mergedOpen,
              focused: mockFocused,
              showSearch: mergedShowSearch,
            }}
          />
        );
      }

      // ============================ Warning =============================
      if (process.env.NODE_ENV !== 'production' && warningProps) {
        warningProps(props);
      }

      // ============================= Render =============================
      const mergedClassName = classNames(prefixCls, className, {
        [`${prefixCls}-focused`]: mockFocused,
        [`${prefixCls}-multiple`]: isMultiple,
        [`${prefixCls}-single`]: !isMultiple,
        [`${prefixCls}-allow-clear`]: allowClear,
        [`${prefixCls}-show-arrow`]: mergedShowArrow,
        [`${prefixCls}-disabled`]: disabled,
        [`${prefixCls}-loading`]: loading,
        [`${prefixCls}-open`]: mergedOpen,
        [`${prefixCls}-customize-input`]: customizeInputElement,
        [`${prefixCls}-show-search`]: mergedShowSearch,
      });

      return () => (
        <div
          class={mergedClassName}
          {...domProps}
          ref={containerRef}
          onMousedown={onInternalMouseDown}
          onKeydown={onInternalKeyDown}
          onKeyup={onInternalKeyUp}
          onFocus={onContainerFocus}
          onBlur={onContainerBlur}
        >
          {mockFocused && !mergedOpen && (
            <span
              style={{
                width: 0,
                height: 0,
                display: 'flex',
                overflow: 'hidden',
                opacity: 0,
              }}
              aria-live="polite"
            >
              {/* Merge into one string to make screen reader work as expect */}
              {`${mergedRawValue.join(', ')}`}
            </span>
          )}
          <SelectTrigger
            ref={triggerRef}
            disabled={disabled}
            prefixCls={prefixCls}
            visible={triggerOpen}
            popupElement={popupNode}
            containerWidth={containerWidth}
            animation={animation}
            transitionName={transitionName}
            dropdownStyle={dropdownStyle}
            dropdownClassName={dropdownClassName}
            direction={direction}
            dropdownMatchSelectWidth={dropdownMatchSelectWidth}
            dropdownRender={dropdownRender}
            dropdownAlign={dropdownAlign}
            getPopupContainer={getPopupContainer}
            empty={!mergedOptions.length}
            getTriggerDOMNode={() => selectorDomRef.current}
          >
            <Selector
              {...props}
              domRef={selectorDomRef}
              prefixCls={prefixCls}
              inputElement={customizeInputElement}
              ref={selectorRef}
              id={mergedId}
              showSearch={mergedShowSearch}
              mode={mode}
              accessibilityIndex={accessibilityIndex}
              multiple={isMultiple}
              tagRender={tagRender}
              values={displayValues}
              open={mergedOpen}
              onToggleOpen={onToggleOpen}
              searchValue={mergedSearchValue}
              activeValue={activeValue}
              onSearch={triggerSearch}
              onSelect={onInternalSelectionSelect}
            />
          </SelectTrigger>

          {arrowNode}
          {clearNode}
        </div>
      );
    },
  });

  // Ref of Select

  return Select;
}
