// composables/useBudgetStore.ts
type Income = { id: string; amount: number };
type Expense = { id: string; name: string; amount: number };

type BudgetState = {
  incomes: Income[];
  expenses: Expense[];
  share: number;
};

export const useBudgetStore = () => {
  // global state
  const state = useSessionState<BudgetState>("budgetStore", () => ({
    incomes: [],
    expenses: [],
    share: 10,
  }));

  // getters
  const totalIncome = computed(() =>
    state.value.incomes.reduce((sum, x) => sum + x.amount, 0)
  );

  const totalExpenses = computed(() =>
    state.value.expenses.reduce((sum, x) => sum + x.amount, 0)
  );

  const balance = computed(() => totalIncome.value - totalExpenses.value);

  const savings = computed(() =>
    Math.floor(balance.value * (state.value.share / 100))
  );
  const expensesWsavings = computed(() => totalExpenses.value + savings.value);
  const balanceWOsavings = computed(() => balance.value - savings.value);
  // actions
  function addIncome(amount: number) {
    state.value.incomes.push({
      id: crypto.randomUUID(),
      amount,
    });
  }

  function removeIncome(id: string) {
    state.value.incomes = state.value.incomes.filter((x) => x.id !== id);
  }

  function addExpense(name: string, amount: number) {
    state.value.expenses.push({
      id: crypto.randomUUID(),
      name,
      amount,
    });
  }

  function removeExpense(id: string) {
    state.value.expenses = state.value.expenses.filter((x) => x.id !== id);
  }

  function reset() {
    state.value = { incomes: [], expenses: [], share: 10 };
  }

  return {
    state,
    totalIncome,
    totalExpenses,
    balance,
    savings,
    balanceWOsavings,
    expensesWsavings,
    addIncome,
    removeIncome,
    addExpense,
    removeExpense,
    reset,
  };
};
