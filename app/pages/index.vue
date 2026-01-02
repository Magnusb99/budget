<template>
  <div class="w-screen flex flex-wrap justify-center gap-20 py-10">
    <div
      class="w-full grid lg:flex justify-center grid-cols-12 items-center mb-10 px-5"
    >
      <UTabs
        v-model="selectedTab"
        class="utabs w-fit col-span-11"
        :items="tabItems"
        variant="link"
        @update:model-value="(val) => selectTab(String(val))"
      />
      <UColorModeSwitch class="col-span-1" />
    </div>
    <div class="w-full">
      <component :is="currentComponent?.component" />
    </div>

    <Calculation class="hidden" />
  </div>
</template>
<script setup lang="ts">
import Expenses from "~/components/Expenses.vue";
import Income from "~/components/Income.vue";
import Overview from "~/components/Overview.vue";

const selectedTab = ref("income");
const items = [
  {
    id: "income",
    label: "Inkomst",
    icon: "carbon:number-1",
    component: Income,
  },
  {
    id: "expenses",
    label: "Utgifter",
    icon: "carbon:number-2",
    component: Expenses,
  },
  {
    id: "overview",
    label: "Översikt",
    icon: "carbon:number-3",
    component: Overview,
  },
];
const tabItems = computed(() =>
  items.map((item) => ({
    label: item.label,
    icon: item.icon,
    value: item.id,
  }))
);
const currentComponent = computed(() => {
  return items.find((item) => item.id === selectedTab.value);
});
function selectTab(id: string) {
  selectedTab.value = id;
}
onMounted(async () => {
  selectedTab.value = items[0]?.id || "";
});
</script>
