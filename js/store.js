/* Persistence layer — wraps localStorage with a default state built from seed data */

const STORAGE_KEY = "pulse.gym.v1";

function buildDefaultState() {
  const meals = {};
  const key = todayKey();
  meals[key] = SEED_MEALS.map((m, i) => ({
    id: `m-${key}-${i}`,
    slot: m.slot,
    name: m.name,
    kcal: m.kcal,
    protein: m.protein,
    carbs: m.carbs,
    fat: m.fat,
    eaten: false,
  }));

  return {
    userName: "Champ",
    exercises: SEED_EXERCISES.map((e) => ({ ...e })),
    exerciseLogs: {}, // { exerciseId: [{date, sets:[{reps,weight}]}] }
    tasks: SEED_TASKS.map((t) => ({ ...t })),
    taskCompletions: {}, // { "YYYY-MM-DD": { taskId: true } }
    meals, // { "YYYY-MM-DD": [ {id, slot, name, kcal, protein, carbs, fat, eaten} ] }
    recipes: [], // user created recipes { id, name, kcal, protein, carbs, fat, ingredients:[{foodId, grams}] }
    goals: { ...NUTRITION_GOALS },
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return buildDefaultState();
    const parsed = JSON.parse(raw);
    // merge with defaults to guard against missing fields on schema evolution
    return { ...buildDefaultState(), ...parsed };
  } catch (e) {
    return buildDefaultState();
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    /* storage full or unavailable — fail silently, app still works in-memory */
  }
}
