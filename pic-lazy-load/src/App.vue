<script>
import Layout from "./components/layout.vue";
import Grid from "./components/grid.vue";
import FlexGrid from "./components/flex-grid.vue";
import Normal from "./components/cards/normal.vue";

export default {
  components: {
    grid: Grid,
    "flex-grid": FlexGrid,
    Layout,
    Normal,
  },
  props: {
    page: Array,
  },
};
</script>

<template>
  <Layout>
    <template #default>
      <div v-for="(floor, floorIdx) in page" :key="floorIdx">
        <component :is="floor.type" v-slot="{ dataItem }" :floor="floor">
          <component :is="floor.card" :data="dataItem" />
        </component>
      </div>
    </template>
  </Layout>
</template>
