<template>
  <b-container>
    <b-row>
      <b-col
        v-for="(column, key) in filledColumns"
        :key="'column_'+key" 
        md="3"
        class="p-0">
        <a 
          v-for="photo in column"
          :key="'photo_'+photo.id"
          :href="photo.file" target="_blank">
          <img class="w-100 p-1 shadow" :src="photo.file"/>
        </a>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
const FilesBlock = require("../../../../enums").FilesBlock;
export default {
  data() {
    return {
      baseUrl: "/files",
      columns: [
        [],
        [],
        [],
        [],
      ]
    }
  },
  computed: {
    filledColumns() {
      return this.columns.filter(c => c.length);
    }
  },
  async mounted() {
    const photos = await this.$getAsync(`${this.baseUrl}`, {
      block: FilesBlock.Photo
    });
    for (let i = 0; i < photos.length; i++) {
      this.columns[i%4].push(photos[i]);
    }
  }
}
</script>