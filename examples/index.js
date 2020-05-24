import 'babel-polyfill';
import { createApp } from 'vue';
import App from './App.vue';
import Tag from 'ant-design-vue/tag';
import 'ant-design-vue/style.js';

createApp(App)
  .use(Tag)
  .mount('#app');

// new Vue({
//   el: '#app',
//   render: h => h(App),
// });
