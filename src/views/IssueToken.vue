<template>
  <v-row class="mx-2">
    <v-col cols="12">
      <v-row class="mt-9">
        <h3>Issue Token</h3>
      </v-row>
      <v-row class="mt-9">
        <v-text-field
            v-model="inputSymbol"
            label="symbol"
            @input="symbolUppercase"
            outlined/>
      </v-row>
      <v-row class="mt-5">
        <v-text-field
            v-model="inputName"
            label="name"
            outlined/>
      </v-row>
      <v-row class="mt-5">
        <v-text-field
            v-model="inputSupply"
            label="supply"
            type="number"
            outlined/>
      </v-row>
      <v-row class="mt-9">
        <v-btn class="white--text" color="blue" :disabled="butDisabled" @click="issue">{{ $t('web.Issue') }}</v-btn>
      </v-row>
      <v-row class="mt-9">
          <v-col class="px-0">
            <h3 class="font-weight-light">{{$t('web.Record')}}</h3>
            <v-data-table
                hide-default-footer
                hide-default-header
                :headers="deployRecordHeaders"
                :items="deployRecord">
            </v-data-table>
          </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>

<script>
import IdeployToken from '@/contract/deployToken/interface'
import {isStrEmpty} from "@/common";
export default {
  name: 'IssueToken',
  data: () => ({
    inputName: '',
    inputSymbol: '',
    inputSupply: '',
    deployRecordHeaders: [
      {
        text: 'name',
        align: 'start',
        value: 'name'
      },
      { text: 'symbol', value: 'symbol' },
      { text: 'supply', value: 'supply' },
      { text: 'address', value: 'address', sortable: false}
    ],
    deployRecord: [],
    butDisabled: false
  }),
  mounted() {
    this.init()
  },
  methods:{
    symbolUppercase() {
      this.inputSymbol= this.inputSymbol.toUpperCase()
    },
    init () {
      let localRecord = localStorage.getItem(this.$store.state.tokenStoreKey)
      console.log('IssueToken', this.$store.state.tokenStoreKey, localRecord, isStrEmpty(localRecord))
      if (!isStrEmpty(localRecord)) {
        this.deployRecord= JSON.parse(localStorage.getItem(this.$store.state.tokenStoreKey))
      }

    },
    async issue() {

      if (this.inputName.toString()==='' || this.inputName.toString().length>20 || this.inputSupply.toString()==='' || this.inputSymbol.toString().length>10 || this.inputSupply.toString()==='' || parseInt(this.inputSupply.toUpperCase()) < 1) {
        console.log('invalid param')
        alert('invalid param')
        return
      }

      this.butDisabled = true
      let that = this
      // 将发布按钮锁定一定时间以免过多发币
      setTimeout(function() {
        that.butDisabled = false
        console.log('this.butDisabled false')
      }, 10 * 1000)

      let deployed = await IdeployToken.deploy(this.inputName, this.inputSymbol, this.inputSupply)
      // 更新界面
      if (deployed) {
        this.deployRecord = JSON.parse(localStorage.getItem(this.$store.state.tokenStoreKey))
      }
    },
  }
}
</script>

