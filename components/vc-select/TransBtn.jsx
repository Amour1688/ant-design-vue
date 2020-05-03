import classNames from 'classnames';

export default {
  name: 'TransBtn',
  functional: true,
  render(_, { className, customizeIcon, customizeIconProps, onMouseDown, onClick, children }) {
    let icon;

    if (typeof customizeIcon === 'function') {
      icon = customizeIcon(customizeIconProps);
    } else {
      icon = customizeIcon;
    }

    return (
      <span
        class={className}
        onMousedown={event => {
          event.preventDefault();
          if (onMouseDown) {
            onMouseDown(event);
          }
        }}
        style={{
          userSelect: 'none',
          WebkitUserSelect: 'none',
        }}
        unselectable="on"
        onClick={onClick}
        aria-hidden
      >
        {icon !== undefined ? (
          icon
        ) : (
          <span className={classNames(className.split(/\s+/).map(cls => `${cls}-icon`))}>
            {children}
          </span>
        )}
      </span>
    );
  },
};
