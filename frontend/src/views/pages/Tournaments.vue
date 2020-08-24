<template>
  <b-container>
    <b-list-group>
      <b-list-group-item
        v-for="(tournament, key) in tournaments"
        :key="'tournament_'+key"
        class="d-flex justify-content-between align-items-center">
        <a :href="tournament.file" target="_blank">{{tournament.name}}</a>
        <a :href="tournament.file" download><b-icon icon="download" /></a>
      </b-list-group-item>
    </b-list-group>
  </b-container>
</template>

<script>
const FilesBlock = require("../../../../enums").FilesBlock;
export default {
  data() {
    return {
      baseUrl: "/files",
      tournaments: [],
    }
  },
  async mounted() {
    this.tournaments = await this.$getAsync(`${this.baseUrl}`, {
      block: FilesBlock.Tournaments
    });
  }
}
</script>