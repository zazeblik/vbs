import Vue from 'vue'
import { BootstrapVue, BootstrapVueIcons } from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import 'vue-search-select/dist/VueSearchSelect.css'
import App from './App.vue'
import router from './router'

import axios from 'axios'
import VueAxios from 'vue-axios'

import {
  ValidationObserver,
  ValidationProvider,
  extend,
  localize
} from "vee-validate";
import ru from "vee-validate/dist/locale/ru.json";
import * as rules from "vee-validate/dist/rules";

const moment = require('moment');
require('moment/locale/ru');
localize("ru", ru);

Object.keys(rules).forEach(rule => extend(rule, rules[rule]));

Vue.component("ValidationObserver", ValidationObserver);
Vue.component("ValidationProvider", ValidationProvider);
Vue.use(require('vue-moment'), { moment });
Vue.use(VueAxios, axios)
Vue.use(BootstrapVue)
Vue.use(BootstrapVueIcons) 
Vue.config.productionTip = false

Vue.prototype.$error = function (message) {
  this.$bvToast.toast(message, {
    title: 'Ошибка',
    variant: 'danger',
    autoHideDelay: 3000,
    solid: true
  })
}

Vue.prototype.$getScheduleView = function (value){
  if (!value) 
    return "";
  const weekdays = moment.weekdaysMin();
  let scheduleRecords = value.split(",");
  let result = [];
  scheduleRecords.forEach(sr => {
    const dayIndex = Number(sr.substr(0, 1));
    result.push(weekdays[dayIndex] + sr.substr(1, sr.length - 4));
  });
  return result.join(", ")
}

Vue.prototype.$modelsToOptions = function (models){
  return models.map(m => {
    return {
      value: m.id,
      text: m.name || m.label || m.id
    }
  })
}

Vue.prototype.$getYears = function() {
  const currentYear = new Date().getFullYear();
  var years = [];
  for (var i = currentYear - 3; i <= currentYear + 3; i++) {
      years.push(i);
  }
  return years;
}

Vue.prototype.$getAsync = async function (url, query) {
  try {
    const response = await axios.get(url, {
      params: query
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      this.$error(error.response.data.message || error.response.data.details || error.response.data);
    }
    return null;
  }
}

Vue.prototype.$postAsync = async function(url, body, handleError) {
  try {
    const response = await axios.post(url, body);
    return response.data;
  } catch (error) {
    if (error.response) {
      this.$error(error.response.data.message || error.response.data.details || error.response.data);
    }
    return handleError ? error.response.data : null;
  }
}

axios.get('/users/authenticated')
  .then((response) => {
    Vue.prototype.$user = response.data
    Vue.prototype.$isAuthenticated = true
  })
  .catch((err) => {
    Vue.prototype.$user = null
    Vue.prototype.$isAuthenticated = false
  })
  .finally(() => new Vue({
    router,
    render: h => h(App),
  }).$mount('#app'));


