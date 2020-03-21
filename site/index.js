import Vue from 'vue';
import App from './App.vue';
import Component from '../components/button';

Vue.use(Component);

new Vue({
  template: h => h(App),
}).$mount('#app');
