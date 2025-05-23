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

Vue.use(VueAxios, axios);
Vue.use(BootstrapVue);
Vue.use(BootstrapVueIcons);
Vue.config.productionTip = false;

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
    const srUnits = sr.split(" ");
    if (srUnits.length != 2) return;
    const dayIndex = Number(srUnits[0]);
    result.push(`${weekdays[dayIndex]}  ${srUnits[1].substr(0, srUnits[1].length - 3)}`);
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

Vue.prototype.$getAsync = async function (url, query, isExcel) {
  try {
    const config = {
      params: query
    };
    if (isExcel) {
      config.responseType = 'blob';
    }
    const response = await axios.get(url, config);
    if (isExcel) {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'export.xlsx');
      document.body.appendChild(link);
      link.click();
      return;
    }
    return response.data;
  } catch (error) {
    if (error.response) {
      this.$error(error.response.data.message || error.response.data.details || error.response.data);
    }
    return null;
  }
}

Vue.prototype.$postAsync = async function(url, body, handleError, options = {}) {
  try {
    const response = await axios.post(url, body, options);
    return response.data;
  } catch (error) {
    if (error.response) {
      this.$error(error.response.data.message || error.response.data.details || error.response.data);
    }
    return handleError ? error.response.data : null;
  }
}

Vue.prototype.$isMobile = function() {
  var check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};

Array.prototype.sum = function(propertySelector = obj => obj) {
  const intialValue = 0;
  return this.reduce((sum, obj) => sum + propertySelector(obj), intialValue);
};

Vue.prototype.$url = window.location.origin;
Vue.prototype.$location = window.location;
Vue.prototype.$document = document;
Vue.prototype.$user = null;

axios.get('/users/authenticated')
  .then((response) => {
    Vue.prototype.$user = response.data
    Vue.prototype.$isAuthenticated = true
    return axios.get('/settings/get')
  })
  .then((response) => {
    Vue.prototype.$settings = response.data
  })
  .catch((err) => {
    Vue.prototype.$user = null
    Vue.prototype.$isAuthenticated = false
  })
  .finally(() => new Vue({
    router,
    render: h => h(App),
  }).$mount('#app'));


