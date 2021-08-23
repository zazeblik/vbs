<template>
  <b-container>
    <b-row>
      <b-col md="8">
        <b-carousel :interval="4000" controls>
          <b-carousel-slide
            v-for="(slide, key) in slides"
            :key="'slides_'+key"
            :img-src="slide.file"
          />
        </b-carousel>
        <b-row>
          <b-col
            v-for="(value, key) in materials"
            :key="'materials_'+key"
            md="6"
            class="material shadow"
          >
            <h4 class="capitalize-letter">{{ value.name }}</h4>
            <div class="article">
              <p>
                <b-img-lazy v-if="value.image" center :src="value.image" :alt="value.name"></b-img-lazy>
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
          </b-col>
        </b-row>
      </b-col>
      <b-col md="4">
        <div
          v-for="(course, key) in courses"
          :key="'course_'+key"
          class="kind-block p-2 mb-2"
          @click="$router.push({path: '/articles/'+course.id})"
        >{{ course.name }}</div>
        <div class="w-100 mb-2" v-if="$settings.vkGroupId">
          <VkCommunity :mode="3" :groupId="$settings.vkGroupId" width="auto" />
        </div>
        <!-- <div class="mb-2">
          <iframe 
            v-if="$settings.instagram"
            :src="`//averin.pro/widget.php?l=${shortNameFromUrl($settings.instagram)}&style=1&gallery=1&s=80&icc=4&icr=3&t=1&tt=${shortNameFromUrl($settings.instagram)}&h=1&ttcolor=FFFFFF&th=c3c3c3&bw=f9f9f9&bscolor=FFFFFF&bs=800080&ch=utf8`"
            allowtransparency="true"
            frameborder="0"
            scrolling="no"
            style="border:none; overflow:hidden; height: 400px; width: 100%;" />
        </div> -->
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import VueGoodshareVkontakte from "vue-goodshare/src/providers/Vkontakte";
import VueGoodshareFacebook from "vue-goodshare/src/providers/Facebook";
import VueGoodshareViber from "vue-goodshare/src/providers/Viber";
import VueGoodshareWhatsApp from "vue-goodshare/src/providers/WhatsApp";
import VueGoodshareTelegram from "vue-goodshare/src/providers/Telegram";
import VkCommunity from "vue-vk/src/components/VKCommunity/VKCommunity";
const SiteBlock = require("../../../enums").SiteBlock;
const FilesBlock = require("../../../enums").FilesBlock;
export default {
  components: {
    VueGoodshareVkontakte,
    VueGoodshareFacebook,
    VueGoodshareViber,
    VueGoodshareWhatsApp,
    VueGoodshareTelegram,
    VkCommunity
  },
  methods: {
    shortNameFromUrl(url){
      let result = url.replace("https://","");
      result = result.replace("http://","");
      result = result.substr(result.indexOf("/")+1);
      if (result.includes("/")){
        result = result.substr(0, result.indexOf("/"));
      }
      return result;
    }
  },
  data() {
    return {
      baseUrl: "/materials",
      filesUrl: "/files",
      widgetsUrl: "/widgets",
      slides: [],
      materials: [],
      courses: [],
      widgets: []
    };
  },
  beforeMount() {
    this.$parent.showHomeHeader();
  },
  async mounted() {
    this.materials = await this.$getAsync(`${this.baseUrl}`, {
      public: true,
      onMain: true,
      sort: "priority DESC",
      limit: 10,
    });
    this.courses = await this.$getAsync(`${this.baseUrl}`, {
      public: true,
      block: SiteBlock.Сourse,
      sort: "priority DESC",
      omit: "content",
    });
    this.slides = await this.$getAsync(`${this.filesUrl}`, {
      block: FilesBlock.Slider,
    });
  },
};
</script>

<style scoped>
.article {
  text-overflow: ellipsis;
  overflow: hidden;
  max-height: 35rem;
}

.kind-block {
  cursor: pointer;
  border-radius: 7px;
  border: 1px solid #000000;
  padding: 3px 15px;
  text-align: center;
  width: 100%;
  text-transform: uppercase;
}

.kind-block:hover {
  background-color: #c8a4cb;
}
</style>