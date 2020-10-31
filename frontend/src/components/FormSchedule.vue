<template>
  <b-form-group>
    <b-input-group v-for="day in schedule" :key="day.label" size="sm">
      <b-input-group-prepend is-text>
        <b-form-checkbox v-model="day.active" switch @change="changeActivation(day)">{{day.label}}</b-form-checkbox>
      </b-input-group-prepend>
        <div
          v-for="(time, index) in day.times" 
          :key="index"
          class="schedule-unit">
          <validation-provider
            :rules="{ regex: /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, required: true }"
            v-slot="validationContext"
          >
            <b-input-group>
              <b-form-input
                size="sm"
                type="text"
                autocomplete="off"
                :value="getShortTime(day.times[index])"
                @input="(t) => { day.times[index] = `${t}:00` }"
                :state="getValidationState(validationContext)"
              />
              <b-input-group-append>
                <b-form-timepicker
                  size="sm"
                  button-only
                  right
                  minutes-step="15"
                  hide-header
                  v-model="day.times[index]"
                  no-close-button
                />
              </b-input-group-append>
            </b-input-group>
        </validation-provider>
        <b-form-select
          size="sm"
          v-model="day.places[index]"
          :options="$modelsToOptions(places)" />
        </div>
      <b-input-group-append>
        <b-button :hidden="!day.active" :disabled="day.times.length == 1" variant="outline-danger" @click="removeTime(day)">
          <b-icon icon="slash-circle-fill" rotate="45" />
        </b-button>
        <b-button :hidden="!day.active" :disabled="day.times.length == 4" variant="outline-success" @click="addTime(day)">
          <b-icon icon="plus-circle-fill" />
        </b-button>
      </b-input-group-append>
    </b-input-group>
  </b-form-group>
</template>

<script>
export default {
  props: [ "value", "places", "defaultPlaceId" ],
  data() {
    let weekdays = this.$moment.weekdaysMin();
    let schedule = [];
    weekdays.forEach((wd, index) => {
      schedule.push({
        label: wd,
        cronValue: index,
        times: [],
        places: [],
        active: false
      });
    });
    schedule.push(schedule.shift());
    return {
      schedule: schedule
    };
  },
  mounted() {
    if (!this.value)
      return;
    const scheduleRecords = this.value.split(",");
    scheduleRecords.forEach(sr => {
      const raw = sr.split(" ");
      const day = Number(raw[0]);
      const time = raw[1];
      const isPlaceAvailable = raw[2] && (this.places.map(x => x.id)).includes(Number(raw[2]));
      const placeId = isPlaceAvailable ? Number(raw[2]) : this.defaultPlaceId; 
      this.schedule.find(r => r.cronValue == day).active = true;
      this.schedule.find(r => r.cronValue == day).times.push(time);
      this.schedule.find(r => r.cronValue == day).places.push(placeId);
    });
  },
  methods: {
    getShortTime(t) {
      return t.substr(0, t.length - 3);
    },
    getValidationState({ dirty, validated, valid = null }) {
      return dirty || validated ? valid : null;
    },
    addTime(day) {
      day.times.push("12:00:00");
      day.places.push(this.defaultPlaceId || this.places[0].id);
    },
    removeTime(day) {
      day.times.pop();
      day.places.pop();
    },
    changeActivation(day) {
      if (day.active){
        day.times = [];
      } else {
        if (day.times.length) return;
        this.addTime(day);
      }
    },
    getValue() {
      const activeDays = this.schedule.filter(d => d.active);
      let scheduleRecords = [];
      let usedTimes = [];
      activeDays.forEach(d => {
        d.times.forEach((t, index) => {
          const result = `${d.cronValue} ${t} ${d.places[index]}`;
          const usedTime = `${d.cronValue} ${t}`;
          if (usedTimes.includes(usedTime))
            return;
          usedTimes.push(usedTime);
          scheduleRecords.push(result);
        })
      })
      return scheduleRecords.join(",");
    }
  }
};
</script>

<style scoped>
.schedule-unit > div, .schedule-unit > select {
  border: none;
  outline: 1px solid #ccc;
  border-radius: unset;
}
</style>