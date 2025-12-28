<template>
  <UCard variant="subtle">
    <UContainer class="flex flex-col gap-4 w-fit">
      <h1 class="mx-auto">Översikt</h1>
      <div>
        <h2 class="flex justify-between gap-10">
          <b>Budget: </b>
          <span class="nr">{{ budgetStore.balanceWOsavings }} kr</span>
        </h2>
      </div>
      <div>
        <h2 class="flex justify-between gap-10">
          <b>Per dag: </b>
          <span class="nr">~{{ perDay.one }}-{{ perDay.zero }} kr</span>
        </h2>
      </div>
      <div>
        <h2 class="flex justify-between gap-10">
          <b>Per vecka: </b>
          <span class="nr">~{{ perWeek }} kr</span>
        </h2>
      </div>
    </UContainer>
  </UCard>
</template>
<script setup lang="ts">
const budgetStore = useBudgetStore();

const perDay = computed(() => {
  const one = Math.floor(budgetStore.balanceWOsavings.value / 31);
  const zero = Math.floor(budgetStore.balanceWOsavings.value / 30);
  return { one, zero };
});
const perWeek = computed(() =>
  Math.floor(budgetStore.balanceWOsavings.value / 4)
);
</script>
