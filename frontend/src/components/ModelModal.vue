<template>
  <div>
    <validation-observer ref="observer" v-slot="{ invalid }">
    <b-modal
      :id="modalId"
      :title="title"
      @close="resetForm"
      @cancel="resetForm"
      size="lg"
      cancel-title="Отмена"
      cancel-variant="outline-secondary"
      ok-title="Сохранить"
      ok-variant="success"
      @ok="saveChanges"
      no-stacking
      :ok-disabled="invalid"
    >
        <b-form>
          <validation-provider
            v-for="(control, index) in itemForm.filter(c => c.type != 'schedule')"
            :key="index"
            :name="getName(control.property)"
            :rules="control.validations"
            v-slot="validationContext"
          >
            <b-form-group
              label-cols-sm="3"
              label-size="sm"
              :label="control.label"
              v-if="!isHiddenControl(control)"
              class="mb-1"
            >
              <b-form-input
                v-if="control.type == 'string'"
                size="sm"
                v-model="control.value"
                :state="getValidationState(validationContext)"
              />
              <b-form-input
                v-if="control.type == 'number'"
                type="number"
                size="sm"
                v-model="control.value"
                :state="getValidationState(validationContext)"
              />
              <b-select
                v-if="control.type == 'enum'"
                size="sm"
                :options="control.options"
                v-model="control.value"
                :state="getValidationState(validationContext)"
              />
              <b-form-checkbox
                v-else-if="control.type == 'checkbox'"
                size="lg"
                v-model="control.value"
                :state="getValidationState(validationContext)"
              />
              <b-form-input
                v-if="control.type == 'color'"
                type="color"
                size="sm"
                v-model="control.value"
                :state="getValidationState(validationContext)"
              />
              <b-form-datepicker
                v-else-if="control.type == 'date'"
                size="sm"
                placeholder="Выберите дату"
                show-decade-nav
                :date-format-options="{ day: '2-digit', month: '2-digit', year: 'numeric'  }"
                value-as-date
                :start-weekday="1"
                v-model="control.value"
                :state="getValidationState(validationContext)"
              />
              <model-select
                v-if="control.type == 'model'"
                :options="$modelsToOptions(control.models)"
                v-model="control.value"
                :isDisabled="!control.models.length"
                :state="getValidationState(validationContext)"
              />
              <b-input-group
                v-if="control.type == 'datetime'"
                size="sm" >
                <b-form-datepicker
                  placeholder="Выберите дату"
                  show-decade-nav
                  :date-format-options="{ day: '2-digit', month: '2-digit', year: 'numeric'  }"
                  value-as-date
                  :start-weekday="1"
                  :ref="'date_' + control.property"
                  :value="control.date"
                  @input="date => {
                    control.date = date;
                    const time = control.time.split(':');
                    date.setHours(time[0]);
                    date.setMinutes(time[1]);
                    date.setSeconds(0, 0);
                    control.value = date;
                  }"
                  :state="getValidationState(validationContext)"
                />
                <b-form-timepicker
                  placeholder="Выберите время"
                  minutes-step="15"
                  :ref="'time_' + control.property"
                  hide-header
                  :value="$moment(control.value).format('HH:mm')"
                  @input="t => {
                    control.time = t;
                    let date = control.date;
                    const time = t.split(':');
                    date.setHours(time[0]);
                    date.setMinutes(time[1]);
                    date.setSeconds(0, 0);
                    control.value = date;
                  }"
                  :state="getValidationState(validationContext)"
                  no-close-button 
                />
              </b-input-group>
              <b-form-invalid-feedback
                :id="'feedback_'+control.property"
              >{{ validationContext.errors[0] }}</b-form-invalid-feedback>
            </b-form-group>
          </validation-provider>
          <b-form-group
            label-cols-sm="3"
            label-size="sm"
            v-if="itemForm.some(c => c.type == 'schedule')"
            :label="itemForm.find(c => c.type == 'schedule').label"
            class="mb-1"
          >
            <FormSchedule
              :value="itemForm.find(c => c.type == 'schedule').value"
              ref="formSchedule"
            />
          </b-form-group>
        </b-form>
      
    </b-modal>
    </validation-observer>
  </div>
</template>

<script>
import { ModelSelect } from 'vue-search-select'
import FormSchedule from '../components/FormSchedule'

export default {
  components: {
    ModelSelect,
    FormSchedule
  },
  props: [ "baseUrl", "itemForm", "modalId" ],
  data() {
    return {
      title: "",
      id: null,
      isEdit: false
    };
  },
  methods: {
    getValidationState({ dirty, validated, valid = null }) {
      return dirty || validated ? valid : null;
    },
    isHiddenControl(control) {
      if (control.hidden) return true;
      if (control.visibility) return !control.visibility(this.itemForm);
      return false;
    },
    getFormValues() {
      let result = {};
      this.itemForm.forEach((c, index) => {
        switch (c.type) {
          case "string":
          case "number":
          case "color":
          case "model":
          case "month":
          case "year":
          case "collection":
          case "enum":
            result[c.property] = c.value;
            break;
          case "checkbox":
            result[c.property] = c.value || false;
            break;
          case "date":
          case "datetime":
            result[c.property] = c.value ? c.value.getTime() : null;
            break;
          case "schedule":
            result[c.property] = this.$refs["formSchedule"].getValue() || null;
            break;
          default:
            break;
        }
      });
      return result;
    },
    showEdit(item, index, button) {
      this.isEdit = true;
      this.title = `Редактирование: ${item.name || ""}`;
      this.id = item.id;
      
      this.itemForm.forEach(c => {
        switch (c.type) {
          case "string":
          case "number":
          case "color":
          case "schedule":
            c.value = item[c.property] || c.defaultValue;
            break;
          case "model":
            c.value = item[c.property].id || item[c.property];
            break;
          case "collection":
          case "enum":
            c.value = item[c.property];
            break;
          case "checkbox":
            c.value = item[c.property] || c.defaultValue || false;
            break;
          case "date":
            c.value = item[c.property] ? new Date(item[c.property]) : null;
          case "datetime":
            c = this.setDateTimeValues(c, new Date(item[c.property]));
            break;
          default:
            break;
        }
      });
      
      this.$root.$emit("bv::show::modal", this.modalId, button);
    },
    showAdd() {
      this.isEdit = false;
      this.title = 'Добавление';
      this.setDefaultValues();
      this.$root.$emit("bv::show::modal", this.modalId);
    },
    setDefaultValues(){
      this.itemForm.forEach(c => {
        switch (c.type) {
          case "string":
          case "number":
          case "color":
          case "schedule":
          case "model":
            c.value = c.value || null;
            break;
          case "enum":
            c.value = c.value;
            break;
          case "collection":
            c.value = c.value || [];
            break;
          case "checkbox":
            c.value = c.value || false;
            break;
          case "date":
            c.value = c.value || null; 
            break;
          case "datetime":
            let defaultDate = new Date();
            defaultDate.setHours(17, 0, 0, 0);
            c = this.setDateTimeValues(c, c.value || defaultDate);
            break;
          default:
            break;
        }
      });
    },
    setDateTimeValues(field, value){
      field.value = value;
      field.date = value;
      field.time = this.$moment(value).format("HH:mm");
      return field;
    },
    async saveChanges() {
      const formValues = this.getFormValues();
      if (this.isEdit){
        await this.$postAsync(`${this.baseUrl}/edit/${this.id}`, formValues);
      } else {
        await this.$postAsync(`${this.baseUrl}/create`, formValues);
      }
      
      this.resetForm();
      this.$emit("formSaved");
    },
    getName(property) {
      const item = this.itemForm.find(f => f.property == property);
      return item ? item.label : property;
    },
    resetForm() {
      this.title = "";
      this.id = null;
      this.itemForm.forEach(c => {
        c.value = null;
      });

      this.$nextTick(() => {
        this.$refs.observer.reset();
      });
    }
  }
};
</script>