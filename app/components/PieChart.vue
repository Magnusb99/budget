<template>
  <div class="w-full max-w-sm mx-auto">
    <h2 class="text-center font-semibold text-2xl">Utgifter</h2>
    <canvas ref="canvasRef" />
  </div>
</template>

<script setup lang="ts">
import Chart from "chart.js/auto";

type expense = {
  id: string;
  name: string;
  amount: number;
  type: { label: string; value: string }; // name = label, value = färg
};

const props = defineProps<{
  expenses: expense[];
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
let chart: Chart | null = null;

// Gruppar per kategori (1 slice per typ)
const grouped = computed(() => {
  const map = new Map<string, { label: string; color: string; sum: number }>();

  for (const e of props.expenses) {
    const key = e.type.label; // ✅ string key
    const curr = map.get(key);

    if (!curr) {
      map.set(key, {
        label: e.type.label, // ✅ label
        color: e.type.value, // ✅ color
        sum: e.amount,
      });
    } else {
      curr.sum += e.amount;
    }
  }
  const saved = useBudgetStore().savings;
  if (saved.value > 0) {
    map.set("Sparande", {
      label: "Sparande",
      color: "#34D399", // Grön färg
      sum: saved.value,
    });
  }

  return Array.from(map.values());
});

const buildChart = () => {
  if (!canvasRef.value) return;

  chart?.destroy();

  const config = {
    type: "pie" as const,
    data: {
      labels: grouped.value.map((x) => x.label),
      datasets: [
        {
          data: grouped.value.map((x) => x.sum),
          backgroundColor: grouped.value.map((x) => x.color),
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom" as const,
        },
        tooltip: {
          callbacks: {
            label: (ctx: any) => {
              const label = ctx.label ?? "";
              const value = ctx.parsed ?? 0;
              return `${label}: ${value} kr`;
            },
          },
        },
      },
    },
  };

  chart = new Chart(canvasRef.value, config);
};

onMounted(buildChart);

watch(() => props.expenses, buildChart, { deep: true });

onBeforeUnmount(() => {
  chart?.destroy();
  chart = null;
});
</script>
