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
        no-enforce-focus
        :ok-disabled="invalid"
      >
        <b-overlay :show="showSpinner" rounded="sm">
          <b-form>
            <validation-provider
              v-for="(control, index) in itemForm.filter((c) => !lastFormTypes.includes(c.type))"
              :key="index"
              :name="getName(control.property)"
              :rules="getControlRules(control)"
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
                  v-if="control.type == 'password'"
                  type="password"
                  :placeholder="control.placeholder"
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
                <b-input-group v-else-if="control.type == 'date'">
                  <b-form-input
                    size="sm"
                    :value="control.formattedDate"
                    @input="(dateString) => {
                      control.formattedDate = dateString;
                      control.value = $moment(dateString, dateShowFormat).toDate();
                    }"
                    type="text"
                    placeholder="Введите дату (DD.MM.YYYY)"
                    autocomplete="off"
                    :state="getValidationState(validationContext)"
                  />
                  <b-input-group-append>
                    <b-form-datepicker
                      size="sm"
                      button-only
                      value-as-date
                      @input="(date) => {
                        control.formattedDate = $moment(date).format(dateShowFormat);
                        control.value = date;
                      }"
                      right
                      :date-format-options="{
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      }"
                      :start-weekday="1"
                      v-model="control.value"
                    />
                  </b-input-group-append>
                </b-input-group>
                <model-select
                  v-if="control.type == 'model'"
                  :options="$modelsToOptions(control.models)"
                  :value="control.value"
                  @input="(value) => {
                    control.value = value;
                    if (control.onChange){
                      control.onChange(value);
                    }
                  }"
                  :isDisabled="!control.models.length"
                  :state="getValidationState(validationContext)"
                />
                <b-input-group v-if="control.type == 'datetime'" size="sm">
                  <validation-provider
                    :rules="{regex: /^([0-2][0-9]|(3)[0-1])(\.)(((0)[0-9])|((1)[0-2]))(\.)\d{4}$/i, required: true }"
                    v-slot="validationContext"
                    class="w-50"
                  >
                    <b-input-group>
                      <b-form-input
                        size="sm"
                        type="text"
                        placeholder="Введите дату (DD.MM.YYYY)"
                        autocomplete="off"
                        :value="control.formattedDate"
                        @input="(dateString) => {
                          control.formattedDate = dateString;
                          const date = $moment(dateString, dateShowFormat).toDate();
                          const time = control.time.split(':');
                          date.setHours(time[0]);
                          date.setMinutes(time[1]);
                          date.setSeconds(0, 0);
                          control.value = date;
                        }"
                        :state="getValidationState(validationContext)"
                      />
                      <b-input-group-append>
                        <b-form-datepicker
                          size="sm"
                          button-only
                          right
                          show-decade-nav
                          value-as-date
                          :date-format-options="{
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          }"
                          :start-weekday="1"
                          :ref="'date_' + control.property"
                          :value="control.value"
                          @input="(date) => {
                            control.formattedDate = $moment(date).format(dateShowFormat);
                            const time = control.time.split(':');
                            date.setHours(time[0]);
                            date.setMinutes(time[1]);
                            date.setSeconds(0, 0);
                            control.value = date;
                          }"
                        />
                      </b-input-group-append>
                    </b-input-group>
                  </validation-provider>
                  <validation-provider
                    :rules="{ regex: /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, required: true }"
                    v-slot="validationContext"
                    class="w-50"
                  >
                    <b-input-group>
                      <b-form-input
                        size="sm"
                        type="text"
                        placeholder="Введите время (HH:mm)"
                        autocomplete="off"
                        :value="control.time"
                        @input="(t) => {
                          control.time = t;
                          let date = control.value;
                          const time = t.split(':');
                          date.setHours(time[0]);
                          date.setMinutes(time[1]);
                          date.setSeconds(0, 0);
                          control.value = date;
                        }"
                        :state="getValidationState(validationContext)"
                      />
                      <b-input-group-append>
                        <b-form-timepicker
                          size="sm"
                          button-only
                          right
                          minutes-step="15"
                          :ref="'time_' + control.property"
                          hide-header
                          :value="control.time"
                          @input="(t) => {
                            const time = t.split(':');
                            control.time = [time[0],time[1]].join(':');
                            let date = control.value;
                            date.setHours(time[0]);
                            date.setMinutes(time[1]);
                            date.setSeconds(0, 0);
                            control.value = date;
                          }"
                          no-close-button
                        />
                      </b-input-group-append>
                    </b-input-group>
                  </validation-provider>
                </b-input-group>
                <b-form-invalid-feedback :id="'feedback_' + control.property">{{
                  validationContext.errors[0]
                }}</b-form-invalid-feedback>
              </b-form-group>
            </validation-provider>
            <b-form-group
              label-cols-sm="3"
              label-size="sm"
              v-if="itemForm.some((c) => c.type == 'schedule')"
              :label="itemForm.find((c) => c.type == 'schedule').label"
              class="mb-1"
            >
              <FormSchedule
                :value="itemForm.find((c) => c.type == 'schedule').value"
                ref="formSchedule"
              />
            </b-form-group>
            <b-form-group
              label-cols-sm="3"
              label-size="sm"
              v-if="itemForm.some((c) => c.type == 'countPrices')"
              :label="itemForm.find((c) => c.type == 'countPrices').label"
              class="mb-1"
            >
              <FormCountPrices
                :value="itemForm.find((c) => c.type == 'countPrices').value"
                ref="formCountPrices"
              />
            </b-form-group>
          </b-form>
        </b-overlay>
      </b-modal>
    </validation-observer>
  </div>
</template>

<script>
import { ModelSelect } from "vue-search-select";
import FormSchedule from "../components/FormSchedule";
import FormCountPrices from "../components/FormCountPrices";

export default {
  components: {
    ModelSelect,
    FormSchedule,
    FormCountPrices
  },
  props: ["baseUrl", "itemForm", "modalId"],
  data() {
    return {
      title: "",
      dateShowFormat: "DD.MM.YYYY",
      id: null,
      isEdit: false,
      showSpinner: false,
      lastFormTypes: ["schedule", "countPrices"],
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
    getControlRules(control) {
      if (control.validations) return control.validations;
      if (control.rules) return control.rules(this.itemForm);
      return {};
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
          case "password":
            if (c.value) result[c.property] = c.value;
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
          case "countPrices":
            result[c.property] = this.$refs["formCountPrices"].getValue() || null;
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
      this.itemForm.forEach((c) => {
        switch (c.type) {
          case "string":
          case "html":
          case "color":
          case "schedule":
          case "countPrices":
            c.value = item[c.property] || c.defaultValue;
            break;
          case "password":
            c.validations.required = false;
            c.placeholder = "Введите новый пароль...";
            break;
          case "number":
            c.value = this.getNumberDefaultValue(
              item[c.property],
              c.defaultValue
            );
            break;
          case "model":
            c.value = item[c.property]
              ? item[c.property].id || item[c.property]
              : null;
            break;
          case "collection":
            c.value = item[c.property];
            break;
          case "checkbox":
            c.value = this.getCheckboxDefaultValue(
              item[c.property],
              c.defaultValue
            );
            break;
          case "enum":
            c.value = item[c.property] || c.options[0].value;
            break;
          case "date":
            c.value = item[c.property] ? new Date(item[c.property]) : null;
            c.formattedDate = item[c.property]
              ? this.$moment(item[c.property]).format(this.dateShowFormat)
              : "";
            break;
          case "datetime":
            c = this.setDateTimeValues(c, this.$moment(item[c.property]));
            break;
          default:
            break;
        }
      });

      this.$root.$emit("bv::show::modal", this.modalId, button);
    },
    showAdd() {
      this.isEdit = false;
      this.title = "Добавление";
      this.setDefaultValues();
      this.$root.$emit("bv::show::modal", this.modalId);
    },
    setDefaultValues() {
      this.itemForm.forEach((c) => {
        switch (c.type) {
          case "string":
          case "color":
          case "schedule":
          case "model":
            c.value = c.value || null;
            break;
          case "countPrices":
            c.value = c.value || [{count: 1, price: 1000}];
            break;
          case "date":
            c.value = null;
            c.formattedDate = null;
            break;
          case "password":
            c.validations.required = true;
            c.placeholder = "Введите пароль...";
            break;
          case "number":
            c.value = this.getNumberDefaultValue(c.value, c.defaultValue);
            break;
          case "enum":
            c.value = c.value || c.options[0].value;
            break;
          case "collection":
            c.value = c.value || [];
            break;
          case "checkbox":
            c.value = this.getCheckboxDefaultValue(c.value, c.defaultValue);
            break;
          case "datetime":
            let defaultDate = new Date();
            defaultDate.setHours(17, 0, 0, 0);
            const date = c.value || defaultDate;
            c = this.setDateTimeValues(c, this.$moment(date));
            break;
          default:
            break;
        }
      });
    },
    setDateTimeValues(field, value) {
      field.value = value.toDate();
      field.formattedDate = value.format(this.dateShowFormat);
      field.time = value.format("HH:mm");
      return field;
    },
    async saveChanges() {
      const formValues = this.getFormValues();
      if (this.isEdit) {
        await this.$postAsync(`${this.baseUrl}/edit/${this.id}`, formValues);
      } else {
        await this.$postAsync(`${this.baseUrl}/create`, formValues);
      }

      this.resetForm();
      this.$emit("formSaved");
    },
    getName(property) {
      const item = this.itemForm.find((f) => f.property == property);
      return item ? item.label : property;
    },
    getCheckboxDefaultValue(value, defaultValue) {
      if (typeof value === "boolean") {
        return value;
      } else if (typeof defaultValue === "boolean") {
        return defaultValue;
      } else {
        return false;
      }
    },
    getNumberDefaultValue(value, defaultValue) {
      if (typeof value === "number") {
        return value;
      } else if (typeof defaultValue === "number") {
        return defaultValue;
      } else {
        return null;
      }
    },
    resetForm() {
      this.title = "";
      this.id = null;
      this.itemForm.forEach((c, index) => {
        c.value = null;
        delete c.onChange;
      });
      this.$nextTick(() => {
        this.$refs.observer.reset();
      });
    },
  },
};
</script>

<style scoped>
</style>