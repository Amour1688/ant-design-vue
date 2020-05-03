import { ref, watchEffect } from '@vue/composition-api';
// import KeyCode from '../_util/KeyCode';
import useMemo from '../_util/hooks/useMergedState';
import { isValidElement } from '../_util/props-util';
import classNames from 'classnames';
import List from '../vc-virtual-list';
import TransBtn from './TransBtn';

const Fragment = {
  functional: true,
  render(_, ctx) {
    return ctx.children;
  },
};

/**
 * Using virtual list of option display.
 * Will fallback to dom if use customize render.
 */
const OptionList = ({
  prefixCls,
  id,
  flattenOptions,
  childrenAsData,
  values,
  searchValue,
  multiple,
  defaultActiveFirstOption,
  height,
  itemHeight,
  notFoundContent,
  open,
  menuItemSelectedIcon,
  virtual,
  onSelect,
  onToggleOpen,
  onActiveValue,
  onScroll,
}) =>
  // ref,
  {
    const itemPrefixCls = `${prefixCls}-item`;

    const memoFlattenOptions = useMemo(
      () => flattenOptions,
      [open, flattenOptions],
      (prev, next) => next[0] && prev[1] !== next[1],
    );

    // =========================== List ===========================
    const listRef = ref(null);

    const onListMouseDown = event => {
      event.preventDefault();
    };

    const scrollIntoView = index => {
      if (listRef.value) {
        listRef.value.scrollTo({ index });
      }
    };

    // ========================== Active ==========================
    const getEnabledActiveIndex = (index, offset = 1) => {
      const len = memoFlattenOptions.length;

      for (let i = 0; i < len; i += 1) {
        const current = (index + i * offset + len) % len;

        const { group, data } = memoFlattenOptions[current];
        if (!group && !data.disabled) {
          return current;
        }
      }

      return -1;
    };

    const activeIndex = ref(getEnabledActiveIndex(0));
    const setActive = index => {
      activeIndex.value = index;

      // Trigger active event
      const flattenItem = memoFlattenOptions[index];
      if (!flattenItem) {
        onActiveValue(null, -1);
        return;
      }

      onActiveValue(flattenItem.data.value, index);
    };

    // Auto active first item when list length or searchValue changed
    watchEffect(() => {
      setActive(defaultActiveFirstOption !== false ? getEnabledActiveIndex(0) : -1);
    }, [memoFlattenOptions.length, searchValue]);

    // Auto scroll to item position in single mode
    watchEffect(() => {
      /**
       * React will skip `onChange` when component update.
       * `setActive` function will call root accessibility state update which makes re-render.
       * So we need to delay to let Input component trigger onChange first.
       */
      const timeoutId = setTimeout(() => {
        if (!multiple && open && values.size === 1) {
          const value = Array.from(values)[0];
          const index = memoFlattenOptions.findIndex(({ data }) => data.value === value);
          setActive(index);
          scrollIntoView(index);
        }
      });

      return () => clearTimeout(timeoutId);
    });

    // ========================== Values ==========================
    const onSelectValue = value => {
      if (value !== undefined) {
        onSelect(value, { selected: !values.has(value) });
      }

      // Single mode should always close by select
      if (!multiple) {
        onToggleOpen(false);
      }
    };

    // ========================= Keyboard =========================
    // React.useImperativeHandle(ref, () => ({
    //   onKeyDown: event => {
    //     const { which } = event;
    //     switch (which) {
    //       // >>> Arrow keys
    //       case KeyCode.UP:
    //       case KeyCode.DOWN: {
    //         let offset = 0;
    //         if (which === KeyCode.UP) {
    //           offset = -1;
    //         } else if (which === KeyCode.DOWN) {
    //           offset = 1;
    //         }

    //         if (offset !== 0) {
    //           const nextActiveIndex = getEnabledActiveIndex(activeIndex + offset, offset);
    //           scrollIntoView(nextActiveIndex);
    //           setActive(nextActiveIndex);
    //         }

    //         break;
    //       }

    //       // >>> Select
    //       case KeyCode.ENTER: {
    //         // value
    //         const item = memoFlattenOptions[activeIndex];
    //         if (item && !item.data.disabled) {
    //           onSelectValue(item.data.value);
    //         } else {
    //           onSelectValue(undefined);
    //         }

    //         if (open) {
    //           event.preventDefault();
    //         }

    //         break;
    //       }

    //       // >>> Close
    //       case KeyCode.ESC: {
    //         onToggleOpen(false);
    //       }
    //     }
    //   },
    //   onKeyUp: () => {},

    //   scrollTo: index => {
    //     scrollIntoView(index);
    //   },
    // }));

    // ========================== Render ==========================
    if (memoFlattenOptions.length === 0) {
      return (
        <div
          role="listbox"
          id={`${id}_list`}
          class={`${itemPrefixCls}-empty`}
          onMousedown={onListMouseDown}
        >
          {notFoundContent}
        </div>
      );
    }

    function renderItem(index) {
      const item = memoFlattenOptions[index];
      const value = item && item.data.value;
      return item ? (
        <div key={index} role="option" id={`${id}_list_${index}`} aria-selected={values.has(value)}>
          {value}
        </div>
      ) : null;
    }

    return (
      <Fragment>
        <div role="listbox" id={`${id}_list`} style={{ height: 0, overflow: 'hidden' }}>
          {renderItem(activeIndex - 1)}
          {renderItem(activeIndex)}
          {renderItem(activeIndex + 1)}
        </div>
        <List
          itemKey="key"
          ref={listRef}
          data={memoFlattenOptions}
          height={height}
          itemHeight={itemHeight}
          fullHeight={false}
          onMouseDown={onListMouseDown}
          onScroll={onScroll}
          virtual={virtual}
        >
          {({ group, groupOption, data }, itemIndex) => {
            const { label, key } = data;

            // Group
            if (group) {
              return (
                <div className={classNames(itemPrefixCls, `${itemPrefixCls}-group`)}>
                  {label !== undefined ? label : key}
                </div>
              );
            }

            const { disabled, value, title, children, style, className, ...otherProps } = data;

            // Option
            const selected = values.has(value);

            const optionPrefixCls = `${itemPrefixCls}-option`;
            const optionClassName = classNames(itemPrefixCls, optionPrefixCls, className, {
              [`${optionPrefixCls}-grouped`]: groupOption,
              [`${optionPrefixCls}-active`]: activeIndex === itemIndex && !disabled,
              [`${optionPrefixCls}-disabled`]: disabled,
              [`${optionPrefixCls}-selected`]: selected,
            });

            const mergedLabel = childrenAsData ? children : label;

            const iconVisible =
              !menuItemSelectedIcon || typeof menuItemSelectedIcon === 'function' || selected;

            return (
              <div
                {...otherProps}
                aria-selected={selected}
                class={optionClassName}
                title={title}
                onMouseMove={() => {
                  if (activeIndex === itemIndex || disabled) {
                    return;
                  }

                  setActive(itemIndex);
                }}
                onClick={() => {
                  if (!disabled) {
                    onSelectValue(value);
                  }
                }}
                style={style}
              >
                <div className={`${optionPrefixCls}-content`}>{mergedLabel || value}</div>
                {isValidElement(menuItemSelectedIcon) || selected}
                {iconVisible && (
                  <TransBtn
                    className={`${itemPrefixCls}-option-state`}
                    customizeIcon={menuItemSelectedIcon}
                    customizeIconProps={{ isSelected: selected }}
                  >
                    {selected ? '✓' : null}
                  </TransBtn>
                )}
              </div>
            );
          }}
        </List>
      </Fragment>
    );
  };

// const RefOptionList = React.forwardRef<RefOptionListProps, OptionListProps<SelectOptionsType>>(
//   OptionList,
// );
// RefOptionList.displayName = 'OptionList';

// export default RefOptionList;
export default OptionList;
