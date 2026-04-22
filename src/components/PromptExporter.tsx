import { useMemo, useState } from "react";

import type { CharacterPromptExport } from "../types";

interface PromptExporterProps {
  onExport: () => CharacterPromptExport | null;
}

export function PromptExporter({ onExport }: PromptExporterProps) {
  const [exportedJson, setExportedJson] = useState<string>("");
  const [copyStatus, setCopyStatus] = useState<string>("");

  const canCopy = useMemo(() => exportedJson.length > 0, [exportedJson]);

  const handleGenerate = () => {
    const payload = onExport();
    if (!payload) {
      setExportedJson("");
      setCopyStatus(
        "Complete required fields before export (race, class, background).",
      );
      return;
    }

    setExportedJson(JSON.stringify(payload, null, 2));
    setCopyStatus("Export generated.");
  };

  const handleCopy = async () => {
    if (!canCopy) {
      return;
    }

    try {
      await navigator.clipboard.writeText(exportedJson);
      setCopyStatus("JSON copied to clipboard.");
    } catch {
      setCopyStatus(
        "Clipboard unavailable. You can still copy from the text area.",
      );
    }
  };

  return (
    <section className="exporter">
      <h2>Prompt Export</h2>
      <p className="step-help">
        Generates a self-contained JSON with selected entities, abilities,
        spellcasting, and source metadata.
      </p>

      <div className="row-actions">
        <button
          type="button"
          className="button primary"
          onClick={handleGenerate}
        >
          Generate exportPromptJSON()
        </button>
        <button
          type="button"
          className="button secondary"
          disabled={!canCopy}
          onClick={handleCopy}
        >
          Copy JSON
        </button>
      </div>

      {copyStatus ? <p className="step-help">{copyStatus}</p> : null}

      <textarea
        value={exportedJson}
        onChange={() => {
          // Keep export output read-only from user edits.
        }}
        placeholder="Exported JSON will appear here"
        rows={16}
        readOnly
      />
    </section>
  );
}
