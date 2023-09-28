<template>
  <v-expansion-panels class="home_panels">
    <v-expansion-panel
      v-for="item in questions"
      :key="item.id"
    >
      <v-expansion-panel-header>{{ $t(item.title) }}</v-expansion-panel-header>
      <v-expansion-panel-content>
        {{ $t(item.content) }}
      </v-expansion-panel-content>
    </v-expansion-panel>
  </v-expansion-panels>
</template>
<script>
export default {
  data() {
    return {
      questions: [
        {
          id: 0,
          title: 'home.FAQ1T',
          content: 'home.FAQ1C'
        },
        {
          id: 1,
          title: 'home.FAQ2T',
          content: 'home.FAQ2C'
        },
        {
          id: 2,
          title: 'home.FAQ3T',
          content: 'home.FAQ3C'
        },
        {
          id: 3,
          title: 'home.FAQ4T',
          content: 'home.FAQ4C'
        }
      ]
    }
  }
}
</script>
<style lang="scss">
.home_panels{
  .v-expansion-panel-header{
    font-size: .24rem;
  }
  .v-expansion-panel-content__wrap{
    color: #969799;
  }
}
</style>
