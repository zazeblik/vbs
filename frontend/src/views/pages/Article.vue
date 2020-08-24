<template>
  <div>
    <b-container>
      <div class="material shadow">
        <h4 class="capitalize-letter">{{ name }}</h4>
        <div class="article">
          <p>
            <b-img-lazy v-if="image" center :src="image" :alt="name"></b-img-lazy>
          </p>
          <div v-html="content"></div>
        </div>
        <div class="article-footer">
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
      name: null,
      image: null,
      content: null,
    }
  },
  async mounted(){
    const article = await this.$getAsync(`${this.baseUrl}/${this.$route.params.id}`);
    this.name = article.name;
    this.image = article.image;
    this.content = article.content;
  }
}
</script>