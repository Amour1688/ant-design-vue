import classNames from 'classnames';

export default {
  functional: true,
  render(h, { height, offset, children, prefixCls }) {
    let outerStyle = {};

    let innerStyle = {
      display: 'flex',
      flexDirection: 'column',
    };

    if (offset !== undefined) {
      outerStyle = { height, position: 'relative', overflow: 'hidden' };

      innerStyle = {
        ...innerStyle,
        transform: `translateY(${offset}px)`,
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
      };
    }

    return (
      <div style={outerStyle}>
        <div
          style={innerStyle}
          className={classNames({
            [`${prefixCls}-holder-inner`]: prefixCls,
          })}
        >
          {children}
        </div>
      </div>
    );
  },
};
