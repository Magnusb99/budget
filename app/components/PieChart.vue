<template>
  <div class="w-full max-w-sm mx-auto">
    <h2 class="text-center font-semibold text-2xl mb-5">Utgifter</h2>
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
const store = useBudgetStore();

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
  const saved = store.savings;
  if (saved.value > 0) {
    map.set("Sparande", {
      label: "Sparande",
      color: "#34D399", // Grön färg
      sum: saved.value,
    });
  }

  return Array.from(map.values());
});
function getChartParts() {
  return {
    labels: grouped.value.map((x) => x.label),
    data: grouped.value.map((x) => x.sum),
    colors: grouped.value.map((x) => x.color),
  };
}
function createChart() {
  if (!canvasRef.value) return;

  const { labels, data, colors } = getChartParts();

  chart = new Chart(canvasRef.value, {
    type: "doughnut",
    data: {
      labels,
      datasets: [
        {
          data,
          backgroundColor: colors,
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      animation: false, // ✅ gör uppdateringar snabba
      plugins: {
        legend: { position: "bottom" },
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
  });
}

function updateChart() {
  if (!chart) return;

  const { labels, data, colors } = getChartParts();

  chart.data.labels = labels;
  chart.data.datasets[0]!.data = data;
  // Chart.js tillåter backgroundColor som (string | CanvasGradient | CanvasPattern)[]
  (chart.data.datasets[0]!.backgroundColor as any) = colors;

  chart.update("none"); // ✅ ingen animation, snabb
}

onMounted(() => {
  createChart();
});

// ✅ lyssna på grouped istället (inte props.expenses)
// då uppdaterar vi bara när den faktiska datastrukturen ändras.
watch(grouped, () => {
  if (!chart) return;
  updateChart();
});

onBeforeUnmount(() => {
  chart?.destroy();
  chart = null;
});
function getChartPng() {
  return chart?.toBase64Image("image/png", 1) ?? null;
}

defineExpose({ getChartPng });
</script>
