<template>
  <UCollapsible
    class="flex flex-col gap-4 w-[20vw] absolute top-10 left-10 p-5 bg-neutral-800 rounded-2xl shadow-2xl"
    :unmount-on-hide="false"
    defaultOpen
  >
    <UButton
      class="group flex justify-between"
      label="Uträkning"
      color="neutral"
      variant="subtle"
      trailing-icon="i-lucide-chevron-down"
      :ui="{
        trailingIcon:
          'group-data-[state=open]:rotate-180 transition-transform duration-200',
      }"
    />
    <template #content>
      <div>
        <h2 class="flex justify-between gap-5">
          <b>Inkomst:</b>

          <span class="nr text-success-400"
            >{{ budgetStore.totalIncome }} :-</span
          >
        </h2>
        <h2 class="flex justify-between">
          <b>Utgifter:</b>
          <span class="nr text-error-400">
            {{ budgetStore.totalExpenses }} :-</span
          >
        </h2>

        <h2 class="flex justify-between">
          <b>Spara:</b
          ><span class="nr text-success-400">{{ budgetStore.savings }} :-</span>
        </h2>

        <h2 class="flex justify-between">
          <b>Total: </b
          ><span class="nr">{{ budgetStore.balanceWOsavings }} :-</span>
        </h2>
      </div>
    </template>
  </UCollapsible>
</template>

<script setup lang="ts">
const budgetStore = useBudgetStore();
</script>
