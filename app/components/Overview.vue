<template>
  <UContainer
    class="w-[90%] lg:w-auto flex flex-col items-center p-10 lg:flex-row lg:items-start lg:justify-around bg-elevated/50 ring ring-default rounded-xl gap-10"
  >
    <UContainer class="flex flex-col gap-3">
      <h1 class="mx-auto text-2xl">Översikt</h1>

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
          <span class="nr">~{{ salaryInfo.perDay }} kr</span>
        </h2>
        <USeparator class="mt-3" />
      </div>
      <div>
        <h2 class="flex justify-between gap-10">
          <b>Per vecka: </b>
          <span class="nr">~{{ salaryInfo.perWeek }} kr</span>
        </h2>
      </div>
      <UContainer class="w-fit my-5 border p-5 rounded-2xl">
        <Icon name="carbon:information" class="mx-auto" size="48" />
        <p class="my-5">{{ salaryInfo.msg }}</p>
      </UContainer>
    </UContainer>

    <UContainer>
      <ClientOnly>
        <PieChart ref="pieRef" :expenses="expenses" />
        <template #fallback>
          <USkeleton class="h-96 w-96" />
        </template>
      </ClientOnly>

      <UContainer class="w-fit mx-auto mt-5 text-center">
        <UButton
          variant="soft"
          @click="openpdf(PDFREF)"
          :disabled="loading"
          :icon="loading ? 'svg-spinners:pulse-2' : 'carbon:document-pdf'"
        >
          {{ loading ? "Skapar PDF..." : "Öppna PDF" }}</UButton
        >
        <p class="text-center" v-if="loading">
          <i>Det kan ta en liten stund.</i>
        </p>
      </UContainer>
    </UContainer>
  </UContainer>
</template>

<script setup lang="ts">
const budgetStore = useBudgetStore();
const loading = ref(false);
import dayjs from "dayjs";
const PDFREF = ref<Blob | null>(null);
const toast = useToast();
const expenses = computed(() => {
  return budgetStore.state.value.expenses;
});
const pieRef = ref<{ getChartPng: () => string | null } | null>(null);

const salaryInfo = computed(() => {
  const today = dayjs().date();
  let daysInMonth = dayjs().daysInMonth();

  let salaryDay = 25;
  if (today > 25) salaryDay = daysInMonth; // eller vad du egentligen vill göra här

  const dayName = dayjs().date(25).format("ddd");

  let effectiveSalaryDay = 25;
  let extraText = "";

  if (dayName === "Sun") {
    effectiveSalaryDay = 23;
    extraText = " är en söndag, så löningen kommer att ske fredagen innan.";
  } else if (dayName === "Sat") {
    effectiveSalaryDay = 24;
    extraText = " är en lördag, så löningen kommer att ske fredagen innan.";
  }

  const budget = budgetStore.balanceWOsavings.value;

  const perDay = Math.floor(budget / effectiveSalaryDay);
  const perWeek = Math.floor(budget / (effectiveSalaryDay / 4));

  const msg = `Det är ${effectiveSalaryDay} dagar kvar till löning. Löningen sker den ${dayjs()
    .date(25)
    .format("DD[:e] ")}${extraText}`;

  return { perDay, perWeek, msg };
});

async function ceratePdf() {
  const chartPng = pieRef.value?.getChartPng();

  try {
    const res = await fetch("/api/pdf", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        budget: budgetStore.balanceWOsavings.value,
        incomes: budgetStore.state.value.incomes,
        expenses: budgetStore.state.value.expenses,
        savings: budgetStore.savings.value,
        perDay: salaryInfo.value.perDay,
        perWeek: salaryInfo.value.perWeek,
        dayToSalary: salaryInfo.value.msg,
        chartPng,
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`PDF API failed (${res.status}): ${text}`);
    }

    const blob = await res.blob();
    PDFREF.value = blob;
  } catch (error) {
    toast.add({
      title: "Något gick fel...",
      description:
        "Kunde inte skapa PDF. Försök igen senare eller kontakta support.",
      color: "error",
    });
    console.error("Failed to create PDF:", error);
  }
}
const openpdf = (pdfBlob: Blob | null) => {
  if (!pdfBlob) return;
  loading.value = true;
  const url = URL.createObjectURL(pdfBlob);
  loading.value = false;
  window.open(url, "_blank");
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 10000);
};
onMounted(async () => {
  await nextTick();
  await new Promise((r) => setTimeout(r, 400));

  await ceratePdf();
});
</script>
