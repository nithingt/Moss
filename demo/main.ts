import { STAGES, createMoss, renderSvg, stageFor } from "../src/index";

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

const stage = $("stage");
const stageName = $("stage-name");
const ageLabel = $("age");
const slider = $<HTMLInputElement>("slider");
const lifetime = $("lifetime");
const born = $<HTMLInputElement>("born");
const bornResult = $("born-result");

function formatAge(age: number): string {
  if (age < 1) return `${Math.round(age * 12)} months old`;
  return `${age.toFixed(1)} years old`;
}

function show(age: number) {
  slider.value = String(age);
  stage.innerHTML = renderSvg(age, { size: 260 });
  stageName.textContent = stageFor(age).name;
  ageLabel.textContent = formatAge(age);
}

slider.addEventListener("input", () => show(Number(slider.value)));

for (const [i, s] of STAGES.entries()) {
  const until = STAGES[i + 1]?.from ?? 60;
  const age = s.from === 0 ? 0 : (s.from + until) / 2;
  const button = document.createElement("button");
  button.innerHTML = `${renderSvg(age, { size: 72 })}${s.name}<span>from year ${s.from}</span>`;
  button.addEventListener("click", () => show(age));
  lifetime.append(button);
}

born.addEventListener("change", () => {
  if (!born.value) return;
  const moss = createMoss({ bornAt: born.value });
  bornResult.textContent = `${moss.stage().name}, ${formatAge(moss.age())}`;
  show(Math.min(moss.age(), 60));
});

show(0);
