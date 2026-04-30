import {
    Clipboard,
    Dna,
    RotateCcw,
    Scroll,
    Shield,
    Sparkles,
    Sword,
    Zap,
} from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";

import type {
    BuilderBackground,
    BuilderClass,
    BuilderRace,
    BuilderSpell,
    BuilderSubclass,
} from "../types";

interface FinalSummaryProps {
  race: BuilderRace | null;
  builderClass: BuilderClass | null;
  subclass: BuilderSubclass | null;
  background: BuilderBackground | null;
  selectedSpells: BuilderSpell[];
  onStartOver: () => void;
}

export function FinalSummary({
  race,
  builderClass,
  subclass,
  background,
  selectedSpells,
  onStartOver,
}: FinalSummaryProps) {
  const [exportedJson, setExportedJson] = useState("");
  const [copyStatus, setCopyStatus] = useState("");

  const characterDescription = useMemo(() => {
    const parts: string[] = [];

    if (race) {
      parts.push(race.name);
    }

    if (builderClass) {
      let classPart = builderClass.name;
      if (subclass) {
        classPart = `${builderClass.name} (${subclass.name})`;
      }
      parts.push(classPart);
    }

    if (parts.length === 0) return null;

    let description = `Your character is a ${parts.join(" ")}`;

    if (background) {
      description += ` with a ${background.name} background`;
    }

    if (selectedSpells.length > 0) {
      description += `, wielding ${selectedSpells.length} spell${selectedSpells.length !== 1 ? "s" : ""}`;
    }

    return description + ".";
  }, [race, builderClass, subclass, background, selectedSpells]);

  const handleExport = () => {
    const payload: Record<string, unknown> = {};

    if (race) {
      payload.race = { name: race.name, source: race.source };
    }
    if (builderClass) {
      payload.class = { name: builderClass.name, source: builderClass.source };
    }
    if (subclass) {
      payload.subclass = {
        name: subclass.name,
        source: subclass.source,
        features: subclass.features,
      };
    }
    if (background) {
      payload.background = {
        name: background.name,
        source: background.source,
      };
    }
    if (selectedSpells.length > 0) {
      payload.spells = selectedSpells.map((s) => ({
        name: s.name,
        source: s.source,
        level: s.level,
      }));
    }

    const json = JSON.stringify(payload, null, 2);
    setExportedJson(json);
    setCopyStatus("Export generated.");
  };

  const handleCopy = async () => {
    if (!exportedJson) return;
    try {
      await navigator.clipboard.writeText(exportedJson);
      setCopyStatus("✓ Copied to clipboard!");
    } catch {
      setCopyStatus("Clipboard unavailable. Copy manually from the text area.");
    }
  };

  const summaryItems: {
    label: string;
    value: string | undefined;
    source: string | undefined;
    icon: ReactNode;
  }[] = [
    {
      label: "Race",
      value: race?.name,
      source: race?.source,
      icon: <Dna size={13} />,
    },
    {
      label: "Class",
      value: builderClass?.name,
      source: builderClass?.source,
      icon: <Sword size={13} />,
    },
    {
      label: "Subclass",
      value: subclass?.name,
      source: subclass?.source,
      icon: <Shield size={13} />,
    },
    {
      label: "Background",
      value: background?.name,
      source: background?.source,
      icon: <Scroll size={13} />,
    },
  ];

  return (
    <section>
      <div className="summary-hero">
        <h2>✦ Character Summary ✦</h2>
        {characterDescription && (
          <p className="summary-description">{characterDescription}</p>
        )}
      </div>

      <div className="summary-grid">
        {summaryItems.map((item) => (
          <div key={item.label} className="summary-card">
            <span className="summary-card-label">
              {item.icon} {item.label}
            </span>
            <span className="summary-card-value">
              {item.value ?? "Not selected"}
            </span>
            {item.source && (
              <span className="summary-card-source">{item.source}</span>
            )}
          </div>
        ))}
      </div>

      {selectedSpells.length > 0 && (
        <div className="summary-spells-section">
          <h3>
            <Sparkles size={14} /> Selected Spells ({selectedSpells.length})
          </h3>
          <div className="summary-spells-grid">
            {selectedSpells.map((spell) => (
              <span key={spell.id} className="summary-spell-tag">
                {spell.name}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="summary-actions">
        <button
          type="button"
          className="button secondary"
          onClick={onStartOver}
        >
          <RotateCcw size={14} /> Start Over
        </button>
        <button type="button" className="button primary" onClick={handleExport}>
          <Zap size={14} /> Generate Export
        </button>
      </div>

      {exportedJson && (
        <div className="export-section">
          <h3>JSON Export</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
            {copyStatus}
          </p>

          <div className="export-actions">
            <button
              type="button"
              className="button secondary"
              onClick={handleCopy}
            >
              <Clipboard size={14} /> Copy JSON
            </button>
          </div>

          <textarea
            value={exportedJson}
            readOnly
            rows={14}
            onClick={(e) => (e.target as HTMLTextAreaElement).select()}
          />
        </div>
      )}
    </section>
  );
}
