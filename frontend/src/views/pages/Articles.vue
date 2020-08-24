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
        <div class="article-footer">
          <b-link :to="'/articles/'+value.id">Подробнее...</b-link>
          <div class="text-right">
            <VueGoodshareVkontakte has_icon />
            <VueGoodshareFacebook has_icon />
            <VueGoodshareViber has_icon />
            <VueGoodshareWhatsApp has_icon /> 
          </div>
        </div>
      </div>
    </b-container>
  </div>
</template>

<script>
import VueGoodshareVkontakte from "vue-goodshare/src/providers/Vkontakte";
import VueGoodshareFacebook from "vue-goodshare/src/providers/Facebook";
import VueGoodshareViber from "vue-goodshare/src/providers/Viber";
import VueGoodshareWhatsApp from "vue-goodshare/src/providers/WhatsApp";
import VueGoodshareTelegram from "vue-goodshare/src/providers/Telegram";
const SiteBlock = require("../../../../enums").SiteBlock;
export default {
  components: {
    VueGoodshareVkontakte,
    VueGoodshareFacebook,
    VueGoodshareViber,
    VueGoodshareWhatsApp,
    VueGoodshareTelegram
  },
  data() {
    return {
      baseUrl: "/materials",
      articles: []
    }
  },
  async mounted() {
    this.articles = await this.$getAsync(`${this.baseUrl}`, {
      public: true,
      block: SiteBlock.Articles,
      sort: 'priority DESC'
    });
  }
}
</script>

<style scoped>
.article {
  max-height: 35rem;
  text-overflow: ellipsis;
  overflow: hidden;
}
</style>