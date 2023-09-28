<template>
  <v-container class="px-0">
    <v-row>
      <v-spacer/>
      <v-combobox
          v-model="comboboxValue"
          :items=comboboxItems
          style="max-width: 190px"
          dense
          outlined
          @change="change"
          class="mr-5"
      ></v-combobox>
    </v-row>

    <v-img
        max-height="3073"
        max-width="750"
        :src=selectItem
    ></v-img>

  </v-container>
</template>

<script>
export default {
  name: "ImgView",
  data() {
    return {
      selectItem:'',
      comboboxValue: 'English', //当前选定值
      comboboxItems: ['English','中文'],
      items: [
        {type: 'en', tag: 'English', url: './static/images/roadmap_en.jpg'},
        {type: 'cn', tag: '中文', url: './static/images/roadmap_cn.jpg'}
      ],
    }
  },
  mounted() {
    this.init(this.comboboxValue)
  },
  methods: {
    init(fileType) {
      console.log('init',fileType, this.$i18n.locale)
      for(let i=0; i<this.items.length;i++) {
        if (this.items[i].tag===fileType) {
          this.selectItem=this.items[i].url
          break
        }
      }
    },

    change(){
      console.log('change', this.comboboxValue)
      this.init(this.comboboxValue)
    }

  }
}
</script>

<style scoped>

</style>
