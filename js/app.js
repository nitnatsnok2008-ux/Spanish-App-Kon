/* App logic — state, rendering, interactions */

let state = loadState();
let currentView = "home";
let selectedDay = todayIndex();
let activeLogExerciseId = null;
let calcIngredients = []; // [{foodId, grams}]
let calcTargetSlot = MEAL_SLOTS[0];

function persist() {
  saveState(state);
}

function toast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.remove("show"), 1800);
}

/* ---------- Navigation ---------- */

function navigate(view) {
  currentView = view;
  document.querySelectorAll(".view").forEach((v) => {
    v.classList.toggle("hidden", v.dataset.view !== view);
  });
  document.querySelectorAll(".tab").forEach((t) => {
    t.classList.toggle("active", t.dataset.nav === view);
  });
  renderCurrentView();
}

function renderCurrentView() {
  if (currentView === "home") renderHome();
  if (currentView === "training") renderTraining();
  if (currentView === "meals") renderMeals();
  if (currentView === "tasks") renderTasks();
}

/* ---------- HOME ---------- */

function renderHome() {
  const hour = new Date().getHours();
  document.getElementById("greetingTime").textContent =
    hour < 11 ? "Guten Morgen" : hour < 18 ? "Guten Tag" : "Guten Abend";
  document.getElementById("greetingName").textContent = `Hey, ${state.userName} 👋`;
  document.getElementById("avatarBtn").textContent = state.userName.charAt(0).toUpperCase();

  const dIdx = todayIndex();
  const title = DAY_TITLES[dIdx] || "Ruhetag";
  const dayExercises = state.exercises.filter((e) => e.day === dIdx);
  document.getElementById("heroDayLabel").textContent = `Heute · ${WEEKDAYS[dIdx]}`;
  document.getElementById("heroWorkoutTitle").textContent = title;
  document.getElementById("heroWorkoutSub").textContent =
    dayExercises.length > 0 ? `${dayExercises.length} Übungen · ca. ${dayExercises.length * 9} Min` : "Genieß deine Erholung";

  const totals = todayNutritionTotals();
  setRing("ringCalories", "statCaloriesVal", totals.kcal, state.goals.kcal, Math.round(totals.kcal));
  setRing("ringProtein", "statProteinVal", totals.protein, state.goals.protein, Math.round(totals.protein));

  const key = todayKey();
  const doneTasks = state.tasks.filter((t) => state.taskCompletions[key]?.[t.id]).length;
  setRing("ringTasks", "statTasksVal", doneTasks, state.tasks.length || 1, `${doneTasks}/${state.tasks.length}`);

  renderHomeTasks();
  renderHomeMeals();
}

function setRing(ringId, valId, value, goal, label) {
  const ring = document.getElementById(ringId);
  const pct = goal > 0 ? Math.min(1, value / goal) : 0;
  ring.style.setProperty("--p", pct.toFixed(3));
  document.getElementById(valId).textContent = label;
}

function renderHomeTasks() {
  const key = todayKey();
  const list = document.getElementById("homeTasksList");
  const tasks = state.tasks.slice(0, 4);
  if (tasks.length === 0) {
    list.innerHTML = `<div class="empty-state">Noch keine Aufgaben — leg los in „Aufgaben“.</div>`;
    return;
  }
  list.innerHTML = tasks
    .map((t) => {
      const checked = !!state.taskCompletions[key]?.[t.id];
      return taskRowHTML(t, checked);
    })
    .join("");
  list.querySelectorAll("[data-task-toggle]").forEach((el) => {
    el.addEventListener("click", () => toggleTask(el.dataset.taskToggle));
  });
}

function renderHomeMeals() {
  const key = todayKey();
  const list = document.getElementById("homeMealsList");
  const meals = state.meals[key] || [];
  if (meals.length === 0) {
    list.innerHTML = `<div class="empty-state">Kein Essensplan für heute.</div>`;
    return;
  }
  list.innerHTML = meals.map((m) => mealRowHTML(m)).join("");
  list.querySelectorAll("[data-meal-toggle]").forEach((el) => {
    el.addEventListener("click", () => toggleMeal(el.dataset.mealToggle));
  });
}

/* ---------- TRAINING ---------- */

function renderDaySelector() {
  const el = document.getElementById("daySelector");
  el.innerHTML = WEEKDAYS_SHORT.map(
    (d, i) => `<button class="day-pill ${i === selectedDay ? "active" : ""} ${i === todayIndex() ? "is-today" : ""}" data-day="${i}">${d}</button>`
  ).join("");
  el.querySelectorAll(".day-pill").forEach((btn) => {
    btn.addEventListener("click", () => {
      selectedDay = Number(btn.dataset.day);
      renderTraining();
    });
  });
}

function renderTraining() {
  renderDaySelector();
  const list = document.getElementById("exerciseList");
  const exercises = state.exercises.filter((e) => e.day === selectedDay);

  if (exercises.length === 0) {
    list.innerHTML = `<div class="empty-state">Ruhetag — keine Übungen geplant.<br><button class="link-btn" id="emptyAddEx">+ Übung hinzufügen</button></div>`;
    document.getElementById("emptyAddEx")?.addEventListener("click", () => openAddExercise());
    return;
  }

  list.innerHTML = exercises.map((ex) => exerciseCardHTML(ex)).join("");

  list.querySelectorAll("[data-log-ex]").forEach((el) => {
    el.addEventListener("click", () => openLogSheet(el.dataset.logEx));
  });
  list.querySelectorAll("[data-del-ex]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      deleteExercise(el.dataset.delEx);
    });
  });
}

function exerciseCardHTML(ex) {
  const logs = state.exerciseLogs[ex.id] || [];
  const last = logs[logs.length - 1];
  const lastWeight = last ? Math.max(...last.sets.map((s) => Number(s.weight) || 0)) : null;
  const history = logs.slice(-3).map((l) => {
    const w = Math.max(...l.sets.map((s) => Number(s.weight) || 0));
    return `<span class="weight-chip">${w}kg</span>`;
  }).join("");

  return `
  <div class="card exercise-card fade-in" data-log-ex="${ex.id}">
    <div class="exercise-top">
      <div>
        <span class="chip chip-tag">${ex.category}</span>
        <h4>${ex.name}</h4>
        <p class="muted">${ex.targetSets} Sätze · ${ex.targetReps} Wdh.</p>
      </div>
      <button class="icon-btn-ghost" data-del-ex="${ex.id}" aria-label="Löschen">
        <svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>
      </button>
    </div>
    <div class="exercise-bottom">
      <div class="history-chips">${history || '<span class="muted small">Noch kein Log</span>'}</div>
      ${lastWeight !== null ? `<span class="last-weight">${lastWeight}<small>kg</small></span>` : ""}
    </div>
  </div>`;
}

function deleteExercise(id) {
  state.exercises = state.exercises.filter((e) => e.id !== id);
  persist();
  renderTraining();
  toast("Übung gelöscht");
}

function openAddExercise() {
  const name = prompt("Name der Übung:");
  if (!name) return;
  const category = prompt("Kategorie (z.B. Brust, Rücken, Beine):", "Allgemein") || "Allgemein";
  const targetSets = Number(prompt("Ziel-Sätze:", "3")) || 3;
  const targetReps = prompt("Ziel-Wiederholungen:", "10-12") || "10-12";
  const ex = {
    id: `ex-${Date.now()}`,
    day: selectedDay,
    name,
    category,
    targetSets,
    targetReps,
  };
  state.exercises.push(ex);
  persist();
  renderTraining();
  toast("Übung hinzugefügt");
}

/* ---------- Log Sheet ---------- */

function openLogSheet(exId) {
  activeLogExerciseId = exId;
  const ex = state.exercises.find((e) => e.id === exId);
  if (!ex) return;
  document.getElementById("logSheetTitle").textContent = ex.name;
  document.getElementById("logSheetSub").textContent = `Ziel: ${ex.targetSets} Sätze × ${ex.targetReps} Wdh.`;

  const logs = state.exerciseLogs[exId] || [];
  const key = todayKey();
  let todayLog = logs.find((l) => l.date === key);
  const setsToShow = todayLog ? todayLog.sets : Array.from({ length: ex.targetSets }, () => ({ reps: "", weight: "" }));

  renderSetRows(setsToShow);
  openSheet("logSheetBackdrop");
}

function renderSetRows(sets) {
  const container = document.getElementById("setRows");
  container.innerHTML = sets
    .map(
      (s, i) => `
    <div class="set-row">
      <span class="set-index">${i + 1}</span>
      <input type="number" class="set-input" placeholder="Wdh." value="${s.reps ?? ""}" data-field="reps" data-idx="${i}">
      <input type="number" class="set-input" placeholder="kg" value="${s.weight ?? ""}" data-field="weight" data-idx="${i}">
      <button class="icon-btn-ghost" data-remove-set="${i}" aria-label="Entfernen">
        <svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>
      </button>
    </div>`
    )
    .join("");

  container.querySelectorAll("[data-remove-set]").forEach((el) => {
    el.addEventListener("click", () => {
      const idx = Number(el.dataset.removeSet);
      const current = collectSetRows();
      current.splice(idx, 1);
      renderSetRows(current);
    });
  });
}

function collectSetRows() {
  const rows = [...document.querySelectorAll("#setRows .set-row")];
  return rows.map((row) => ({
    reps: row.querySelector('[data-field="reps"]').value,
    weight: row.querySelector('[data-field="weight"]').value,
  }));
}

function addSetRow() {
  const current = collectSetRows();
  current.push({ reps: "", weight: "" });
  renderSetRows(current);
}

function saveLog() {
  if (!activeLogExerciseId) return;
  const sets = collectSetRows().filter((s) => s.reps !== "" || s.weight !== "");
  if (sets.length === 0) {
    toast("Bitte mindestens einen Satz eintragen");
    return;
  }
  const key = todayKey();
  if (!state.exerciseLogs[activeLogExerciseId]) state.exerciseLogs[activeLogExerciseId] = [];
  const logs = state.exerciseLogs[activeLogExerciseId];
  const existingIdx = logs.findIndex((l) => l.date === key);
  const entry = { date: key, sets };
  if (existingIdx >= 0) logs[existingIdx] = entry;
  else logs.push(entry);

  persist();
  closeSheet("logSheetBackdrop");
  renderTraining();
  toast("Training gespeichert 💪");
}

/* ---------- Sheets (generic) ---------- */

function openSheet(id) {
  document.getElementById(id).classList.add("open");
}
function closeSheet(id) {
  document.getElementById(id).classList.remove("open");
}

/* ---------- TASKS ---------- */

function taskRowHTML(t, checked) {
  return `
  <div class="card row-card ${checked ? "is-checked" : ""}" data-task-toggle="${t.id}">
    <span class="checkbox ${checked ? "checked" : ""}">
      <svg viewBox="0 0 24 24"><path d="M4 12l5 5L20 6"/></svg>
    </span>
    <span class="row-text">${t.text}</span>
  </div>`;
}

function renderTasks() {
  const key = todayKey();
  const list = document.getElementById("tasksList");
  if (state.tasks.length === 0) {
    list.innerHTML = `<div class="empty-state">Noch keine Aufgaben. Füge oben eine hinzu.</div>`;
    return;
  }
  list.innerHTML = state.tasks
    .map((t) => {
      const checked = !!state.taskCompletions[key]?.[t.id];
      return `
      <div class="card row-card ${checked ? "is-checked" : ""}" data-task-toggle="${t.id}">
        <span class="checkbox ${checked ? "checked" : ""}">
          <svg viewBox="0 0 24 24"><path d="M4 12l5 5L20 6"/></svg>
        </span>
        <span class="row-text">${t.text}</span>
        <button class="icon-btn-ghost" data-del-task="${t.id}" aria-label="Löschen">
          <svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>
        </button>
      </div>`;
    })
    .join("");

  list.querySelectorAll("[data-task-toggle]").forEach((el) => {
    el.addEventListener("click", (e) => {
      if (e.target.closest("[data-del-task]")) return;
      toggleTask(el.dataset.taskToggle);
    });
  });
  list.querySelectorAll("[data-del-task]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      state.tasks = state.tasks.filter((t) => t.id !== el.dataset.delTask);
      persist();
      renderTasks();
    });
  });
}

function toggleTask(id) {
  const key = todayKey();
  if (!state.taskCompletions[key]) state.taskCompletions[key] = {};
  state.taskCompletions[key][id] = !state.taskCompletions[key][id];
  persist();
  renderCurrentView();
}

function addTask() {
  const input = document.getElementById("newTaskInput");
  const text = input.value.trim();
  if (!text) return;
  state.tasks.push({ id: `t-${Date.now()}`, text, recurring: true });
  input.value = "";
  persist();
  renderTasks();
}

/* ---------- MEALS ---------- */

function todayNutritionTotals() {
  const key = todayKey();
  const meals = state.meals[key] || [];
  return meals.reduce(
    (acc, m) => {
      if (m.eaten) {
        acc.kcal += m.kcal;
        acc.protein += m.protein;
        acc.carbs += m.carbs;
        acc.fat += m.fat;
      }
      return acc;
    },
    { kcal: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

function mealRowHTML(m) {
  return `
  <div class="card row-card meal-row ${m.eaten ? "is-checked" : ""}" data-meal-toggle="${m.id}">
    <span class="checkbox ${m.eaten ? "checked" : ""}">
      <svg viewBox="0 0 24 24"><path d="M4 12l5 5L20 6"/></svg>
    </span>
    <div class="row-text">
      <span class="meal-slot-label">${m.slot}</span>
      <span class="meal-name">${m.name}</span>
    </div>
    <span class="meal-kcal">${m.kcal} <small>kcal</small></span>
  </div>`;
}

function toggleMeal(id) {
  const key = todayKey();
  const meals = state.meals[key] || [];
  const meal = meals.find((m) => m.id === id);
  if (meal) meal.eaten = !meal.eaten;
  persist();
  renderCurrentView();
}

function macroBarHTML(label, value, goal, colorClass) {
  const pct = goal > 0 ? Math.min(100, (value / goal) * 100) : 0;
  return `
  <div class="macro-row">
    <div class="macro-row-top">
      <span>${label}</span>
      <span class="muted">${Math.round(value)} / ${goal}${label === "Kalorien" ? "" : "g"}</span>
    </div>
    <div class="bar-track"><div class="bar-fill ${colorClass}" style="width:${pct}%"></div></div>
  </div>`;
}

function renderMeals() {
  const totals = todayNutritionTotals();
  document.getElementById("macroSummary").innerHTML = `
    <h3 class="macro-summary-title">Heute</h3>
    ${macroBarHTML("Kalorien", totals.kcal, state.goals.kcal, "bar-kcal")}
    ${macroBarHTML("Protein", totals.protein, state.goals.protein, "bar-protein")}
    ${macroBarHTML("Kohlenhydrate", totals.carbs, state.goals.carbs, "bar-carbs")}
    ${macroBarHTML("Fett", totals.fat, state.goals.fat, "bar-fat")}
  `;

  const key = todayKey();
  const meals = state.meals[key] || [];
  const list = document.getElementById("mealPlanList");
  list.innerHTML =
    meals.length > 0
      ? meals.map((m) => mealRowHTML(m)).join("")
      : `<div class="empty-state">Kein Plan für heute — erstelle ein Rezept.</div>`;
  list.querySelectorAll("[data-meal-toggle]").forEach((el) => {
    el.addEventListener("click", () => toggleMeal(el.dataset.mealToggle));
  });

  const recipeList = document.getElementById("recipeList");
  recipeList.innerHTML =
    state.recipes.length > 0
      ? state.recipes
          .map(
            (r) => `
      <div class="card recipe-card">
        <div>
          <h4>${r.name}</h4>
          <p class="muted">${Math.round(r.kcal)} kcal · ${Math.round(r.protein)}g P · ${Math.round(r.carbs)}g C · ${Math.round(r.fat)}g F</p>
        </div>
        <button class="btn btn-mini" data-assign-recipe="${r.id}">Heute planen</button>
      </div>`
          )
          .join("")
      : `<div class="empty-state">Noch keine eigenen Rezepte.</div>`;

  recipeList.querySelectorAll("[data-assign-recipe]").forEach((el) => {
    el.addEventListener("click", () => assignRecipeToday(el.dataset.assignRecipe));
  });
}

function assignRecipeToday(recipeId) {
  const recipe = state.recipes.find((r) => r.id === recipeId);
  if (!recipe) return;
  const key = todayKey();
  if (!state.meals[key]) state.meals[key] = [];
  state.meals[key].push({
    id: `m-${Date.now()}`,
    slot: "Snack",
    name: recipe.name,
    kcal: recipe.kcal,
    protein: recipe.protein,
    carbs: recipe.carbs,
    fat: recipe.fat,
    eaten: false,
  });
  persist();
  renderMeals();
  toast("Zum heutigen Plan hinzugefügt");
}

/* ---------- Recipe Calculator Sheet ---------- */

function populateIngredientSelect() {
  const sel = document.getElementById("ingredientSelect");
  sel.innerHTML = FOOD_DB.map((f) => `<option value="${f.id}">${f.name}</option>`).join("");
}

function populateMealSlotPicker() {
  const el = document.getElementById("mealSlotPicker");
  el.innerHTML = MEAL_SLOTS.map(
    (s) => `<button class="day-pill ${s === calcTargetSlot ? "active" : ""}" data-slot="${s}">${s}</button>`
  ).join("");
  el.querySelectorAll("[data-slot]").forEach((btn) => {
    btn.addEventListener("click", () => {
      calcTargetSlot = btn.dataset.slot;
      populateMealSlotPicker();
    });
  });
}

function openCalcSheet() {
  calcIngredients = [];
  populateIngredientSelect();
  populateMealSlotPicker();
  document.getElementById("recipeNameInput").value = "";
  renderCalcIngredients();
  openSheet("calcSheetBackdrop");
}

function addCalcIngredient() {
  const foodId = document.getElementById("ingredientSelect").value;
  const grams = Number(document.getElementById("ingredientGrams").value) || 100;
  calcIngredients.push({ foodId, grams });
  renderCalcIngredients();
}

function computeMacros(ingredients) {
  return ingredients.reduce(
    (acc, ing) => {
      const food = FOOD_DB.find((f) => f.id === ing.foodId);
      if (!food) return acc;
      const factor = ing.grams / 100;
      acc.kcal += food.kcal * factor;
      acc.protein += food.protein * factor;
      acc.carbs += food.carbs * factor;
      acc.fat += food.fat * factor;
      return acc;
    },
    { kcal: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

function renderCalcIngredients() {
  const list = document.getElementById("calcIngredientList");
  list.innerHTML = calcIngredients
    .map((ing, i) => {
      const food = FOOD_DB.find((f) => f.id === ing.foodId);
      return `
      <div class="ingredient-row">
        <span>${food ? food.name : "?"}</span>
        <span class="muted">${ing.grams}g</span>
        <button class="icon-btn-ghost" data-remove-ing="${i}" aria-label="Entfernen">
          <svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>
        </button>
      </div>`;
    })
    .join("");

  list.querySelectorAll("[data-remove-ing]").forEach((el) => {
    el.addEventListener("click", () => {
      calcIngredients.splice(Number(el.dataset.removeIng), 1);
      renderCalcIngredients();
    });
  });

  const totals = computeMacros(calcIngredients);
  document.getElementById("calcMacroSummary").innerHTML = `
    ${macroBarHTML("Kalorien", totals.kcal, Math.max(totals.kcal, 1), "bar-kcal")}
    ${macroBarHTML("Protein", totals.protein, Math.max(totals.protein, 1), "bar-protein")}
    ${macroBarHTML("Kohlenhydrate", totals.carbs, Math.max(totals.carbs, 1), "bar-carbs")}
    ${macroBarHTML("Fett", totals.fat, Math.max(totals.fat, 1), "bar-fat")}
  `;
}

function saveRecipe() {
  const name = document.getElementById("recipeNameInput").value.trim();
  if (!name) {
    toast("Bitte einen Namen eingeben");
    return;
  }
  if (calcIngredients.length === 0) {
    toast("Füge mindestens eine Zutat hinzu");
    return;
  }
  const totals = computeMacros(calcIngredients);
  const recipe = {
    id: `r-${Date.now()}`,
    name,
    ingredients: calcIngredients,
    ...totals,
  };
  state.recipes.push(recipe);

  const key = todayKey();
  if (!state.meals[key]) state.meals[key] = [];
  state.meals[key].push({
    id: `m-${Date.now()}`,
    slot: calcTargetSlot,
    name,
    kcal: totals.kcal,
    protein: totals.protein,
    carbs: totals.carbs,
    fat: totals.fat,
    eaten: false,
  });

  persist();
  closeSheet("calcSheetBackdrop");
  renderMeals();
  toast("Rezept gespeichert & eingeplant 🍽️");
}

/* ---------- Init & Events ---------- */

function ensureTodayMeals() {
  const key = todayKey();
  if (!state.meals[key]) {
    state.meals[key] = SEED_MEALS.map((m, i) => ({
      id: `m-${key}-${i}`,
      slot: m.slot,
      name: m.name,
      kcal: m.kcal,
      protein: m.protein,
      carbs: m.carbs,
      fat: m.fat,
      eaten: false,
    }));
    persist();
  }
}

function bindEvents() {
  document.querySelectorAll("[data-nav]").forEach((el) => {
    el.addEventListener("click", () => navigate(el.dataset.nav));
  });

  document.getElementById("startWorkoutBtn").addEventListener("click", () => navigate("training"));
  document.getElementById("addExerciseBtn").addEventListener("click", () => openAddExercise());

  document.getElementById("addTaskBtn").addEventListener("click", addTask);
  document.getElementById("newTaskInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") addTask();
  });

  document.getElementById("addSetBtn").addEventListener("click", addSetRow);
  document.getElementById("saveLogBtn").addEventListener("click", saveLog);
  document.getElementById("logSheetBackdrop").addEventListener("click", (e) => {
    if (e.target.id === "logSheetBackdrop") closeSheet("logSheetBackdrop");
  });

  document.getElementById("openCalcBtn").addEventListener("click", openCalcSheet);
  document.getElementById("newRecipeBtn").addEventListener("click", openCalcSheet);
  document.getElementById("addIngredientBtn").addEventListener("click", addCalcIngredient);
  document.getElementById("saveRecipeBtn").addEventListener("click", saveRecipe);
  document.getElementById("calcSheetBackdrop").addEventListener("click", (e) => {
    if (e.target.id === "calcSheetBackdrop") closeSheet("calcSheetBackdrop");
  });

  document.getElementById("avatarBtn").addEventListener("click", () => {
    const name = prompt("Dein Name:", state.userName);
    if (name && name.trim()) {
      state.userName = name.trim();
      persist();
      renderHome();
    }
  });
}

function init() {
  ensureTodayMeals();
  bindEvents();
  navigate("home");
}

document.addEventListener("DOMContentLoaded", init);
