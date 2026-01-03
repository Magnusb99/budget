<template>
  <UContainer
    class="flex flex-col items-center p-10 lg:flex-row lg:items-start lg:justify-around bg-elevated/50 ring ring-default rounded-xl gap-10"
  >
    <UContainer class="flex flex-col gap-3">
      <h1 class="mx-auto text-2xl font-semibold">Översikt</h1>
      <div>
        <h2 class="flex justify-between gap-10">
          <b>Budget: </b>
          <span class="nr">{{ budgetStore.balanceWOsavings }} kr</span>
        </h2>
        <USeparator class="mt-3" />
      </div>
      <div>
        <h2 class="flex justify-between gap-10">
          <b>Per dag: </b>
          <span class="nr">~{{ perDay }} kr</span>
        </h2>
        <USeparator class="mt-3" />
      </div>
      <div>
        <h2 class="flex justify-between gap-10">
          <b>Per vecka: </b>
          <span class="nr">~{{ perWeek }} kr</span>
        </h2>
      </div>
      <UContainer class="w-fit my-5 border p-5 rounded-2xl">
        <Icon name="carbon:information" class="mx-auto" size="48" />
        <p class="my-5">{{ dayToSalary }}</p>
      </UContainer>
    </UContainer>

    <UContainer>
      <ClientOnly>
        <PieChart ref="pieRef" :expenses="expenses" />
        <template #fallback>
          <USkeleton class="h-96 w-96" />
        </template>
      </ClientOnly>

      <UContainer class="w-fit mx-auto mt-5">
        <UButton
          class="cursor-pointer"
          variant="soft"
          @click="
            pdfButton(
              budgetStore.balanceWOsavings.value,
              budgetStore.state.value.incomes,
              budgetStore.state.value.expenses,
              budgetStore.savings.value,
              perDay,
              perWeek,
              dayToSalary
            )
          "
          :disabled="loading"
          :icon="loading ? 'svg-spinners:pulse-2' : 'carbon:document-pdf'"
        >
          {{ loading ? "Skapar PDF..." : "Öppna PDF" }}</UButton
        >
      </UContainer>
    </UContainer>
  </UContainer>
</template>

<script setup lang="ts">
const budgetStore = useBudgetStore();
const loading = ref(false);
import dayjs from "dayjs";

const expenses = computed(() => {
  return budgetStore.state.value.expenses;
});
const pieRef = ref<{ getChartPng: () => string | null } | null>(null);
const perDay = ref(0);

const dayToSalary = computed(() => {
  const today = dayjs().date();
  let days = dayjs().daysInMonth();
  if (today > 25) {
    days -= today;
  }
  let salaryDay = dayjs().date(25).date();
  const dayName = dayjs().date(25).format("ddd");
  if (dayName === "Sun") {
    salaryDay -= 2;
    perDay.value = Math.floor(budgetStore.balanceWOsavings.value / salaryDay);
    return `Det är ${salaryDay} dagar kvar till löning. ${dayjs()
      .date(25)
      .format(
        "DD[:e] "
      )} är en söndag, så löningen kommer att ske fredagen innan.`;
  } else if (dayName === "Sat") {
    salaryDay -= 1;
    perDay.value = Math.floor(budgetStore.balanceWOsavings.value / salaryDay);
    return `Det är ${salaryDay} dagar kvar till löning. ${dayjs()
      .date(25)
      .format(
        "DD[:e] "
      )} är en lördag, så löningen kommer att ske fredagen innan.`;
  } else {
    perDay.value = Math.floor(budgetStore.balanceWOsavings.value / salaryDay);
    return `Det är ${salaryDay} dagar kvar till löning. Löningen sker den ${dayjs()
      .date(25)
      .format("DD[:e] ")}.`;
  }
});

const perWeek = computed(() =>
  Math.floor(budgetStore.balanceWOsavings.value / 4)
);

async function pdfButton(
  budget: number,
  incomes: any[],
  expenses: any[],
  savings: number,
  perDay: number,
  perWeek: number,
  dayToSalary: string
) {
  loading.value = true;
  const chartPng = pieRef.value?.getChartPng();
  try {
    const res = await fetch("/api/pdf", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        budget,
        incomes,
        expenses,
        savings,
        perDay,
        perWeek,
        dayToSalary,
        chartPng,
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`PDF API failed (${res.status}): ${text}`);
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);

    window.open(url, "_blank", "noopener,noreferrer");

    // släpp blob-url efter en stund (så minnet inte läcker)
    setTimeout(() => URL.revokeObjectURL(url), 30_000);
  } finally {
    loading.value = false;
  }
}
</script>
