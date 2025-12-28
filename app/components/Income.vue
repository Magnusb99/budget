<template>
  <UCard variant="subtle">
    <UContainer class="flex flex-col gap-10 w-fit">
      <h1 class="mx-auto">Fyll i dina inkomster</h1>
      <UFormField label="Inkomst">
        <div class="flex items-center gap-2">
          <UInput
            v-model="incomeInput"
            type="text"
            inputmode="numeric"
            @keydown.enter="addIncome"
            @input="sanitizeIncome"
            ><template #trailing>kr</template></UInput
          >
          <UButton
            variant="soft"
            class="mt-auto"
            icon="carbon:add"
            @click="addIncome"
          />
        </div>
      </UFormField>
      <div class="w-full">
        <div class="text-right w-full flex gap-1 flex-col">
          <div
            v-for="value in addedIncomes"
            :key="value.id"
            class="w-full flex justify-between"
          >
            <UButton
              icon="carbon:subtract"
              variant="soft"
              color="error"
              size="xs"
              @click="removeIncome(value.id)"
            />
            <p class="nr">{{ value.amount }} :-</p>
          </div>

          <USeparator />
          <div class="w-full flex justify-between">
            <p>Totalt:</p>
            <p class="text-success-400 nr">+ {{ combinedIncomes }} :-</p>
          </div>
        </div>
      </div>
    </UContainer>
  </UCard>
</template>
<script setup lang="ts">
const budgetStore = useBudgetStore();

const incomeInput = ref<string>("");
const addedIncomes = computed(() => {
  return budgetStore.state.value.incomes;
});

const combinedIncomes = budgetStore.totalIncome;

const incomeValue = computed<number | null>(() => {
  const numeric = incomeInput.value.replace(/\s+/g, "");
  if (!numeric) return null;
  return Number(numeric);
});

const addIncome = () => {
  const value = incomeValue.value;
  if (value === null) return; // eller visa felmeddelande
  budgetStore.addIncome(value);
  incomeInput.value = "";
};

const removeIncome = (id: string) => {
  if (id === null) return; // eller visa felmeddelande
  budgetStore.removeIncome(id);
};

const sanitizeIncome = (e: Event) => {
  const el = e.target as HTMLInputElement;

  // Tillåt bara siffror och mellanslag
  let cleaned = el.value.replace(/[^\d ]+/g, "");

  // (valfritt) Normalisera mellanslag: inga dubbla, trim
  cleaned = cleaned.replace(/\s+/g, " ").trim();

  el.value = cleaned;
  incomeInput.value = cleaned;
};
</script>
