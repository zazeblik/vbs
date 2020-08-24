<template>
  <div>
    <b-container>
      <div 
        v-for="(value, key) in articles"
        :key="'articles_'+key"
        class="material shadow">
        <h4 class="capitalize-letter">{{ value.name }}</h4>
        <div class="article">
          <p>
            <b-img-lazy v-if="value.image" center  :src="value.image" :alt="value.name"></b-img-lazy>
          </p>
          <div v-html="value.content"></div>
        </div>
      </div>
    </b-container>
  </div>
</template>

<script>
const SiteBlock = require("../../../../enums").SiteBlock;
export default {
  data() {
    return {
      baseUrl: "/materials",
      articles: []
    }
  },
  async mounted() {
    this.articles = await this.$getAsync(`${this.baseUrl}`, {
      public: true,
      block: SiteBlock.Feedback,
      sort: 'priority DESC'
    });
  }
}
</script>