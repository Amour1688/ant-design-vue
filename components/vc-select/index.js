// based on vc-select 9.2.2
import Vue from 'vue';
import VueCompositionApi from '@vue/composition-api';

Vue.use(VueCompositionApi);

import Select from './Select';
import Option from './Option';
import { SelectPropTypes } from './PropTypes';
import OptGroup from './OptGroup';
Select.Option = Option;
Select.OptGroup = OptGroup;
export { Select, Option, OptGroup, SelectPropTypes };
export default Select;
