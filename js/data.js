/* Seed data — used only on first launch (no localStorage yet) */

const WEEKDAYS = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];
const WEEKDAYS_SHORT = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

function todayIndex() {
  // JS: 0=Sonntag..6=Samstag -> convert to 0=Montag..6=Sonntag
  return (new Date().getDay() + 6) % 7;
}

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const SEED_EXERCISES = [
  { id: "ex1", day: 0, name: "Bankdrücken", category: "Brust", targetSets: 4, targetReps: "8-10" },
  { id: "ex2", day: 0, name: "Schrägbankdrücken Kurzhantel", category: "Brust", targetSets: 3, targetReps: "10-12" },
  { id: "ex3", day: 0, name: "Schulterdrücken", category: "Schultern", targetSets: 3, targetReps: "8-10" },
  { id: "ex4", day: 0, name: "Seitheben", category: "Schultern", targetSets: 3, targetReps: "12-15" },
  { id: "ex5", day: 0, name: "Trizeps am Kabel", category: "Trizeps", targetSets: 3, targetReps: "12-15" },

  { id: "ex6", day: 1, name: "Klimmzüge", category: "Rücken", targetSets: 4, targetReps: "6-10" },
  { id: "ex7", day: 1, name: "Langhantelrudern", category: "Rücken", targetSets: 4, targetReps: "8-10" },
  { id: "ex8", day: 1, name: "Latzug eng", category: "Rücken", targetSets: 3, targetReps: "10-12" },
  { id: "ex9", day: 1, name: "Bizepscurls", category: "Bizeps", targetSets: 3, targetReps: "10-12" },
  { id: "ex10", day: 1, name: "Face Pulls", category: "Schultern", targetSets: 3, targetReps: "15-20" },

  { id: "ex11", day: 2, name: "Kniebeugen", category: "Beine", targetSets: 4, targetReps: "6-8" },
  { id: "ex12", day: 2, name: "Rumänisches Kreuzheben", category: "Beine", targetSets: 3, targetReps: "8-10" },
  { id: "ex13", day: 2, name: "Beinpresse", category: "Beine", targetSets: 3, targetReps: "10-12" },
  { id: "ex14", day: 2, name: "Wadenheben", category: "Waden", targetSets: 4, targetReps: "15-20" },

  { id: "ex15", day: 4, name: "Kreuzheben", category: "Ganzkörper", targetSets: 4, targetReps: "5-6" },
  { id: "ex16", day: 4, name: "Dips", category: "Brust", targetSets: 3, targetReps: "8-12" },
  { id: "ex17", day: 4, name: "Ausfallschritte", category: "Beine", targetSets: 3, targetReps: "10-12" },
  { id: "ex18", day: 4, name: "Plank", category: "Core", targetSets: 3, targetReps: "45-60s" },
];

const DAY_TITLES = {
  0: "Push Day",
  1: "Pull Day",
  2: "Leg Day",
  3: "Ruhetag",
  4: "Ganzkörper",
  5: "Ruhetag",
  6: "Ruhetag",
};

/* Nährwerte pro 100g: kcal, protein, carbs, fat */
const FOOD_DB = [
  { id: "f1", name: "Hähnchenbrust", kcal: 165, protein: 31, carbs: 0, fat: 3.6 },
  { id: "f2", name: "Reis (gekocht)", kcal: 130, protein: 2.7, carbs: 28, fat: 0.3 },
  { id: "f3", name: "Ei", kcal: 155, protein: 13, carbs: 1.1, fat: 11 },
  { id: "f4", name: "Haferflocken", kcal: 389, protein: 17, carbs: 66, fat: 7 },
  { id: "f5", name: "Brokkoli", kcal: 34, protein: 2.8, carbs: 7, fat: 0.4 },
  { id: "f6", name: "Olivenöl", kcal: 884, protein: 0, carbs: 0, fat: 100 },
  { id: "f7", name: "Lachs", kcal: 208, protein: 20, carbs: 0, fat: 13 },
  { id: "f8", name: "Rinderhack (mager)", kcal: 187, protein: 26, carbs: 0, fat: 9 },
  { id: "f9", name: "Nudeln (gekocht)", kcal: 158, protein: 5.8, carbs: 31, fat: 0.9 },
  { id: "f10", name: "Kartoffel", kcal: 77, protein: 2, carbs: 17, fat: 0.1 },
  { id: "f11", name: "Banane", kcal: 89, protein: 1.1, carbs: 23, fat: 0.3 },
  { id: "f12", name: "Mandeln", kcal: 579, protein: 21, carbs: 22, fat: 50 },
  { id: "f13", name: "Griechischer Joghurt", kcal: 59, protein: 10, carbs: 3.6, fat: 0.4 },
  { id: "f14", name: "Milch 1.5%", kcal: 46, protein: 3.4, carbs: 4.9, fat: 1.5 },
  { id: "f15", name: "Gouda Käse", kcal: 356, protein: 25, carbs: 2.2, fat: 27 },
  { id: "f16", name: "Avocado", kcal: 160, protein: 2, carbs: 9, fat: 15 },
  { id: "f17", name: "Süßkartoffel", kcal: 86, protein: 1.6, carbs: 20, fat: 0.1 },
  { id: "f18", name: "Tofu", kcal: 76, protein: 8, carbs: 1.9, fat: 4.8 },
  { id: "f19", name: "Linsen (gekocht)", kcal: 116, protein: 9, carbs: 20, fat: 0.4 },
  { id: "f20", name: "Schwarze Bohnen", kcal: 132, protein: 8.9, carbs: 24, fat: 0.5 },
  { id: "f21", name: "Spinat", kcal: 23, protein: 2.9, carbs: 3.6, fat: 0.4 },
  { id: "f22", name: "Tomate", kcal: 18, protein: 0.9, carbs: 3.9, fat: 0.2 },
  { id: "f23", name: "Vollkornbrot", kcal: 247, protein: 13, carbs: 41, fat: 3.4 },
  { id: "f24", name: "Erdnussbutter", kcal: 588, protein: 25, carbs: 20, fat: 50 },
  { id: "f25", name: "Whey Protein", kcal: 380, protein: 75, carbs: 8, fat: 6 },
];

const MEAL_SLOTS = ["Frühstück", "Mittagessen", "Abendessen", "Snack"];

const SEED_MEALS = [
  { slot: "Frühstück", name: "Haferflocken mit Banane", kcal: 480, protein: 20, carbs: 68, fat: 12 },
  { slot: "Mittagessen", name: "Hähnchen mit Reis & Brokkoli", kcal: 620, protein: 52, carbs: 65, fat: 12 },
  { slot: "Abendessen", name: "Lachs mit Süßkartoffel", kcal: 540, protein: 38, carbs: 42, fat: 22 },
  { slot: "Snack", name: "Griechischer Joghurt & Mandeln", kcal: 260, protein: 16, carbs: 10, fat: 17 },
];

const NUTRITION_GOALS = { kcal: 2400, protein: 160, carbs: 240, fat: 75 };

const SEED_TASKS = [
  { id: "t1", text: "3L Wasser trinken", recurring: true },
  { id: "t2", text: "10.000 Schritte", recurring: true },
  { id: "t3", text: "Vitamine nehmen", recurring: true },
  { id: "t4", text: "Mahlzeiten vorbereiten", recurring: true },
];
