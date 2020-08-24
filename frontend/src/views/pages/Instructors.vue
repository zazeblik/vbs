<template>
  <div>
    <b-container>
      <div 
        v-for="(value, key) in instructors"
        :key="'instructors_'+key"
        class="material shadow">
        <h4 class="capitalize-letter">{{ value.name }}</h4>
        <div class="article">
          <p v-if="value.birthday">Дата рождения: {{$moment(value.birthday).format('DD.MM.yyyy')}}</p>
          <div class="clearfix mb-3" v-html="value.content"></div>
          <b-card v-if="value.groups.length > 0" no-body header="Расписание тренера">
            <b-list-group flush>
              <b-list-group-item 
                v-for="(group, group_key) in value.groups"
                :key="'group_'+group_key"
                class="d-flex justify-content-between align-items-center">
                <span>{{group.name}}</span>
                <small v-if="group.schedule">{{getHumanizedSchedule(group.schedule, group.defaultDuration)}}</small>
              </b-list-group-item>
            </b-list-group>
          </b-card>
        </div>
      </div>
    </b-container>
  </div>
</template>

<script>
export default {
  data() {
    return {
      baseUrl: "/groups/general-default-instructors",
      instructors: []
    }
  },
  methods: {
    getHumanizedSchedule(rawSchedule, duration){
      let results = [];
      let weekdays = this.$moment.weekdaysMin();
      const scheduleRecords = rawSchedule.split(",");
      scheduleRecords.forEach(sr => {
        const raw = sr.split(" ");
        const day = Number(raw[0]);
        const startTime = this.$moment(raw[1], 'HH:mm:ss');
        const endTime = this.$moment(startTime).add(duration, 'minutes');
        results.push(weekdays[day]+" "+ startTime.format("HH:mm")+"-"+endTime.format("HH:mm"));
      });
      return results.join(", ");
    }
  },
  async mounted() {
    this.instructors = await this.$getAsync(`${this.baseUrl}`);
  }
}
</script>