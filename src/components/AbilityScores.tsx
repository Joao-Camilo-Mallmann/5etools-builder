import type { AbilityGenerationMethod, AbilityScores } from "../types";

const ABILITIES: Array<keyof AbilityScores> = [
  "str",
  "dex",
  "con",
  "int",
  "wis",
  "cha",
];

const POINT_BUY_COST: Record<number, number> = {
  8: 0,
  9: 1,
  10: 2,
  11: 3,
  12: 4,
  13: 5,
  14: 7,
  15: 9,
};

interface AbilityScoresProps {
  method: AbilityGenerationMethod;
  scores: AbilityScores;
  modifiers: AbilityScores;
  onMethodChange: (method: AbilityGenerationMethod) => void;
  onScoreChange: (ability: keyof AbilityScores, value: number) => void;
  onApplyStandard: () => void;
  onRollRandom: () => void;
}

function toLabel(ability: keyof AbilityScores): string {
  return ability.toUpperCase();
}

function pointBuyTotal(scores: AbilityScores): number {
  return ABILITIES.reduce((total, ability) => {
    const score = scores[ability];
    const cost = POINT_BUY_COST[score];
    return total + (typeof cost === "number" ? cost : 0);
  }, 0);
}

export function AbilityScoresEditor({
  method,
  scores,
  modifiers,
  onMethodChange,
  onScoreChange,
  onApplyStandard,
  onRollRandom,
}: AbilityScoresProps) {
  return (
    <section>
      <h2>Configure Ability Scores</h2>

      <div
        className="method-group"
        role="group"
        aria-label="Ability score method"
      >
        <button
          type="button"
          className={`chip ${method === "standardArray" ? "chip-active" : ""}`}
          onClick={() => onMethodChange("standardArray")}
        >
          Standard Array
        </button>
        <button
          type="button"
          className={`chip ${method === "pointBuy" ? "chip-active" : ""}`}
          onClick={() => onMethodChange("pointBuy")}
        >
          Point Buy
        </button>
        <button
          type="button"
          className={`chip ${method === "rolled" ? "chip-active" : ""}`}
          onClick={() => onMethodChange("rolled")}
        >
          Rolled
        </button>
      </div>

      <div className="row-actions">
        <button
          type="button"
          className="button secondary"
          onClick={onApplyStandard}
        >
          Apply Standard Array
        </button>
        <button
          type="button"
          className="button secondary"
          onClick={onRollRandom}
        >
          Roll 4d6 Drop Lowest
        </button>
      </div>

      {method === "pointBuy" ? (
        <p className="step-help">
          Point-buy cost: {pointBuyTotal(scores)} / 27
        </p>
      ) : null}

      <div className="ability-grid">
        {ABILITIES.map((ability) => (
          <label key={ability} className="ability-card">
            <span>{toLabel(ability)}</span>
            <input
              type="number"
              min={3}
              max={20}
              value={scores[ability]}
              onChange={(event) =>
                onScoreChange(ability, Number.parseInt(event.target.value, 10))
              }
            />
            <small>
              Modifier {modifiers[ability] >= 0 ? "+" : ""}
              {modifiers[ability]}
            </small>
          </label>
        ))}
      </div>
    </section>
  );
}
