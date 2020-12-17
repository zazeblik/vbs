<template>
  <footer class="bg-dark p-3 mt-3">
    <div class="container">
      <div class="row">
        <div class="col-sm-4 text-center">
          <p class="text-white mb-0 pb-0">
            © {{$settings.name}},
            <span id="cur_year">{{$moment().format('yyyy')}}</span>
          </p>
          <p class="text-white text-center">
            <span v-if="$settings.email">{{$settings.email}}</span>
            <span v-if="$settings.phone">, тел. {{$settings.phone}}</span>
            <br />
            <a v-if="$settings.vk" :href="$settings.vk" target="_blank" class="mr-1">
              <img
                src="img/vk.png"
                border="0"
                :alt="`${$settings.name} Вконтакте`"
                :title="`${$settings.name} Вконтакте`"
                width="16"
                height="16"
                style="border: 0px;"
              />
            </a>
            <a v-if="$settings.fb" :href="$settings.fb" target="_blank" class="mr-1">
              <img
                src="img/fb.png"
                border="0"
                :alt="`${$settings.name} Facebook`"
                :title="`${$settings.name} Facebook`"
                width="16"
                height="16"
                style="border: 0px;"
              />
            </a>
            <a v-if="$settings.marimedia" :href="$settings.marimedia" target="_blank" class="mr-1">
              <img
                src="img/marimedia.png"
                border="0"
                :alt="`${$settings.name} MariMedia`"
                :title="`${$settings.name} MariMedia`"
                width="16"
                height="16"
                style="border: 0px;"
              />
            </a>
            <a v-if="$settings.instagram" :href="$settings.instagram" target="_blank" class="mr-1">
              <img
                src="img/instagram.png"
                border="0"
                :alt="`${$settings.name} Instagram`"
                :title="`${$settings.name} Instagram`"
                width="16"
                height="16"
                style="border: 0px;"
              />
            </a>
          </p>
        </div>
        <div class="col-sm-7 d-flex justify-content-center">
          <div class="px-1">
            <p class="text-center">
              <b-link v-if="$settings.sberUsername && $settings.sberPassword" class="text-white" to="/payment-methods">Способы оплаты</b-link>
              <br v-if="$settings.sberUsername && $settings.sberPassword" />
              <b-link class="text-white" to="/service-rules">Предоставление услуг</b-link>
              <br />
              <b-link class="text-white" to="/contacts">Контакты</b-link>
            </p>
          </div>
          <div class="px-1">
            <p class="text-center">
              <b-link class="text-white" to="/privacy">Политика конфиденциальности</b-link>
              <br />
              <b-link class="text-white" to="/privacy#terms_of_use">Пользовательское соглашение</b-link>
              <br v-if="$settings.sberUsername && $settings.sberPassword" />
              <b-link v-if="$settings.sberUsername && $settings.sberPassword" class="text-white" to="/data-transport">Передача данных</b-link>
            </p>
          </div>
        </div>
        <div class="col-sm-1">
          <a class="text-white" href="#">Наверх</a>
        </div>
      </div>
    </div>
  </footer>
</template>