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
          <span class="nr">~{{ perDay }} kr</span>
        </h2>
      </div>
      <div>
        <h2 class="flex justify-between gap-10">
          <b>Per vecka: </b>
          <span class="nr">~{{ perWeek }} kr</span>
        </h2>
      </div>
    </UContainer>
    <UContainer>
      <p>{{ dayToSalary }}</p>
    </UContainer>
    <uContainer>
      <USeparator class="w-full" color="primary" />
      <PieChart :expenses="expenses" />
    </uContainer>
  </UCard>
</template>
<script setup lang="ts">
const budgetStore = useBudgetStore();
import dayjs from "dayjs";
const expenses = computed(() => {
  return budgetStore.state.value.expenses;
});

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
</script>
