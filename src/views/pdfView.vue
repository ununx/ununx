<template>
<v-container>
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

    <!--  加载本地public下文件  -->

  <v-sheet
      id="scrolling-techniques-7"
      class="overflow-y-auto"
      max-height="2000"
  >
    <v-container>
    <pdf :src=selectItem.url
         v-for="i in numPages"
         :key="i"
         :page="i"></pdf>
    </v-container>
  </v-sheet>
</v-container>
</template>

<script>
import pdf from 'vue-pdf'
export default {
  name: "pdfView",
  components: {pdf},
  data() {
    return {
      selectItem:'',
      comboboxValue: 'English', //当前选定值
      comboboxItems: ['English','中文'],
      items: [
        {type: 'en', tag: 'English', url: './static/whitepaper_en.pdf'},
        {type: 'cn', tag: '中文', url: './static/whitepaper_cn.pdf'}
      ],
      numPages: 14,
    }
  },
  mounted() {
    this.init(this.comboboxValue)
  },
  methods: {
    init(fileType) {
      console.log('init',fileType)
      for(let i=0; i<this.items.length;i++) {
        if (this.items[i].tag===fileType) {
          this.getNumPages(this.items[i])
          break
        }
      }
    },
    // 计算pdf页码总数
    getNumPages(item) {
      console.log('load file', this.comboboxValue, item)
      this.selectItem = item
      let loadingTask = pdf.createLoadingTask(item.url)

      loadingTask.promise
          .then(pdf => {
            console.log('getNumPages', pdf.numPages, loadingTask)
            this.numPages = pdf.numPages
          })
          .catch(err => {
            console.error('pdf 加载失败', err)
          })
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
