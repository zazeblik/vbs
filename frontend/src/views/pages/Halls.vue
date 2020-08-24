<template>
  <div>
    <b-container>
      <div 
        v-for="(value, key) in places"
        :key="'places_'+key"
        class="material shadow">
        <h4 class="capitalize-letter">{{ value.name }}</h4>
        <div class="article">
          <div class="clearfix mb-3" v-html="value.content"></div>
          <b-card v-if="value.groups.length > 0" no-body header="Расписание зала">
            <b-list-group flush>
              <b-list-group-item 
                v-for="(group, group_key) in value.groups"
                :key="'group_'+group_key"
                class="d-flex justify-content-between align-items-center">
                <span>{{group.name}}</span>
                <small v-if="group.schedule">{{getHumanizedSchedule(group.schedule, group.defaultDuration)}}</small>
              </b-list-group-item>
            </b-list-group>
            <b-card-body>
              <b-row>
                <b-col>Цвет в расписании:</b-col>
                <b-col :style="'background: '+value.color+';'"></b-col>
              </b-row>
            </b-card-body>
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
      baseUrl: "/places/materials",
      places: []
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
    this.places = await this.$getAsync(`${this.baseUrl}`);
  }
}
</script>