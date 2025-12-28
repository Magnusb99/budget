<template>
  <UCard variant="subtle">
    <UContainer class="flex flex-col gap-5 w-fit">
      <h1 class="mx-auto">Fyll i dina utgifter</h1>
      <UFormField label="Sparbudget" class="">
        <USlider
          v-model="budgetStore.state.value.share"
          :min="0"
          :max="50"
          :step="5"
          class="my-3"
        />
        <div class="flex justify-between">
          <p>{{ budgetStore.state.value.share }} %</p>
          <p class="nr text-success-400">{{ budgetStore.savings }} :-</p>
        </div>
      </UFormField>
      <USeparator />
      <UFormField class="w-full" label="Namn">
        <div class="flex items-center w-full gap-2">
          <UInput
            v-model="expenseName"
            type="text"
            class="w-full"
          ></UInput>
        </div>
      </UFormField>
      <UFormField label="Utgift">
        <div class="flex items-center gap-2">
          <UInput
            v-model="expenseInput"
            type="text"
            inputmode="numeric"
            @keydown.enter="addExpense"
            @input="sanitizeIncome"
            ><template #trailing>kr</template></UInput
          >
          <UButton
            variant="soft"
            class="mt-auto"
            color="error"
            icon="carbon:add"
            @click="addExpense"
          />
        </div>
      </UFormField>

      <USeparator />
      <div class="w-full">
        <div class="text-right w-full flex gap-1 flex-col">
          <div class="w-full flex justify-between">
            <p>Spara</p>
            <p class="nr">{{ budgetStore.savings }} :-</p>
          </div>
          <div
            v-for="value in addedExpenses"
            :key="value.id"
            class="w-full flex justify-between"
          >
            <UButton
              icon="carbon:subtract"
              variant="soft"
              size="xs"
              @click="removeExpense(value.id)"
            />
            <p>{{ value.name }}</p>
            <p class="nr">{{ value.amount }} :-</p>
          </div>

          <USeparator color="primary" />
          <div class="w-full flex justify-between">
            <p>Totalt:</p>
            <p class="text-error-400 nr">- {{ combinedExpenses }} :-</p>
          </div>
          <div class="w-full flex justify-between">
            <p>Budget:</p>
            <p class="text-primary-400 nr">
              {{ budgetStore.balanceWOsavings }} :-
            </p>
          </div>
        </div>
      </div>
    </UContainer>
  </UCard>
</template>
<script setup lang="ts">
const budgetStore = useBudgetStore();
const toast = useToast();
const expenseInput = ref<string>("");
const expenseName = ref<string>("");

const addedExpenses = computed(() => {
  return budgetStore.state.value.expenses;
});

const combinedExpenses = computed(() => budgetStore.expensesWsavings);

const expenseValue = computed<number | null>(() => {
  const numeric = expenseInput.value.replace(/\s+/g, "");
  if (!numeric) return null;
  return Number(numeric);
});

const addExpense = () => {
  const value = expenseValue.value;
  const name = expenseName.value;

  if (value === null) {
    toast.add({
      title: "Howdy där fella!",
      description: "Du måste ange ett värde till utgiften",
    });
    return;
  }
  budgetStore.addExpense(name, value);
  expenseInput.value = "";
  expenseName.value = "";
};

const removeExpense = (id: string) => {
  if (id === null) return; // eller visa felmeddelande
  budgetStore.removeExpense(id);
};

const sanitizeIncome = (e: Event) => {
  const el = e.target as HTMLInputElement;

  // Tillåt bara siffror och mellanslag
  let cleaned = el.value.replace(/[^\d ]+/g, "");

  // (valfritt) Normalisera mellanslag: inga dubbla, trim
  cleaned = cleaned.replace(/\s+/g, " ").trim();

  el.value = cleaned;
  expenseInput.value = cleaned;
};
</script>
