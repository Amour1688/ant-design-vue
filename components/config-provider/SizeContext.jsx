import PropTypes from '../_util/vue-types';
import { ConfigConsumerProps } from './';

const SizeContext = {
  functional: true,
  props: {
    size: PropTypes.string,
    children: PropTypes.any,
  },
  provide() {
    return {};
  },
  inject: {
    configProvider: { default: () => ConfigConsumerProps },
  },
  render(h, context) {
    const { props, injections } = context;
    const { getPrefixCls } = injections.configProvider;
  },
};

export default SizeContext;
