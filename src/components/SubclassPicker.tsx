import { useMemo, useState } from "react";

import type { BuilderSubclass } from "../types";

interface SubclassPickerProps {
  subclasses: BuilderSubclass[];
  selectedSubclassId: string | null;
  hasSelectedClass: boolean;
  className: string | null;
  onSelect: (subclassId: string | null) => void;
}

export function SubclassPicker({
  subclasses,
  selectedSubclassId,
  hasSelectedClass,
  className,
  onSelect,
}: SubclassPickerProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return subclasses;
    const query = search.toLowerCase();
    return subclasses.filter(
      (sc) =>
        sc.name.toLowerCase().includes(query) ||
        sc.source.toLowerCase().includes(query),
    );
  }, [subclasses, search]);

  if (!hasSelectedClass) {
    return (
      <section>
        <div className="picker-header">
          <h2>Choose Subclass</h2>
        </div>
        <p className="picker-empty">Pick a class first to see subclasses.</p>
      </section>
    );
  }

  if (subclasses.length === 0) {
    return (
      <section>
        <div className="picker-header">
          <h2>Choose Subclass</h2>
        </div>
        {className && (
          <span className="picker-context">
            ⚔ Subclasses for: <strong>{className}</strong>
          </span>
        )}
        <p className="picker-empty">
          This class has no explicit subclass options. You can proceed.
        </p>
      </section>
    );
  }

  const selectedSubclass =
    subclasses.find((sc) => sc.id === selectedSubclassId) ?? null;

  return (
    <section>
      <div className="picker-header">
        <h2>Choose Your Subclass</h2>
        <p>Specialization that defines your unique path within your class.</p>
      </div>

      {className && (
        <span className="picker-context">
          ⚔ Subclasses for: <strong>{className}</strong>
        </span>
      )}

      <div className="picker-search">
        <span className="picker-search-icon">🔍</span>
        <input
          type="text"
          placeholder="Search subclasses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          id="subclass-search"
        />
      </div>

      <p className="picker-count">
        {filtered.length} subclass{filtered.length !== 1 ? "es" : ""} available
      </p>

      {filtered.length > 0 ? (
        <div className="picker-grid">
          {filtered.map((subclass) => (
            <div
              key={subclass.id}
              className={`picker-card ${selectedSubclassId === subclass.id ? "selected" : ""}`}
              onClick={() =>
                onSelect(
                  selectedSubclassId === subclass.id ? null : subclass.id,
                )
              }
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(
                    selectedSubclassId === subclass.id ? null : subclass.id,
                  );
                }
              }}
            >
              <span className="picker-card-name">{subclass.name}</span>
              <span className="picker-card-source">{subclass.source}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="picker-empty">No subclasses match your search.</p>
      )}

      {selectedSubclass && (
        <article className="detail-card">
          <h3>
            {selectedSubclass.name}{" "}
            <span>({selectedSubclass.source})</span>
          </h3>
          <p>
            <strong>Class:</strong> {selectedSubclass.className} (
            {selectedSubclass.classSource})
          </p>
          {selectedSubclass.features.length > 0 && (
            <ul className="compact-list">
              {selectedSubclass.features.slice(0, 6).map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          )}
        </article>
      )}
    </section>
  );
}
