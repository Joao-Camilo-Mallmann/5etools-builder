import {
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    Moon,
    Shield,
    Sun,
} from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

export interface WizardStep {
  id: number;
  title: string;
  isComplete: boolean;
  isLocked: boolean;
  content: ReactNode;
}

interface StepWizardProps {
  steps: WizardStep[];
  currentStep: number;
  sidebar: ReactNode;
  onStepChange: (step: number) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export function StepWizard({
  steps,
  currentStep,
  sidebar,
  onStepChange,
  onNext,
  onPrevious,
}: StepWizardProps) {
  const activeStep = steps.find((step) => step.id === currentStep);
  const isFirstStep = currentStep <= 1;
  const isLastStep = currentStep >= steps.length;

  // ── Theme toggle ────────────────────────────────────────────
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    return (
      (localStorage.getItem("5ebuilder-theme") as "dark" | "light") ?? "dark"
    );
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("5ebuilder-theme", theme);
  }, [theme]);

  return (
    <section className="wizard-shell">
      {/* ── Compact header bar ─────────────────────────────── */}
      <header className="wizard-header">
        <div className="wizard-header__inner">
          <span className="wizard-header__title">
            <Shield size={20} className="wizard-header__crest" />
            <span className="wizard-header__eyebrow">5etools</span>
            Character Builder
          </span>
          <button
            type="button"
            className="wizard-theme-btn"
            onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
            title={
              theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
            }
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </div>
      </header>

      {/* ── Progress Bar ───────────────────────────────────── */}
      <nav className="wizard-progress" aria-label="Creation progress">
        {steps.map((step, index) => {
          const isActive = step.id === currentStep;
          const statusClass = step.isComplete
            ? "is-complete"
            : isActive
              ? "is-active"
              : step.isLocked
                ? "is-locked"
                : "";

          const canClick = step.isComplete && !isActive;

          return (
            <div key={step.id} style={{ display: "contents" }}>
              <div
                className={`wizard-progress-step ${statusClass} ${canClick ? "clickable" : ""}`}
                onClick={canClick ? () => onStepChange(step.id) : undefined}
                role={canClick ? "button" : undefined}
                tabIndex={canClick ? 0 : undefined}
                title={step.title}
                onKeyDown={
                  canClick
                    ? (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onStepChange(step.id);
                        }
                      }
                    : undefined
                }
              >
                <span className="wizard-progress-indicator">
                  {step.isComplete ? <CheckCircle size={14} /> : step.id}
                </span>
                <span className="wizard-progress-label">{step.title}</span>
              </div>

              {index < steps.length - 1 && (
                <div
                  className={`wizard-progress-connector ${step.isComplete ? "filled" : ""}`}
                />
              )}
            </div>
          );
        })}
      </nav>

      {/* ── Body ───────────────────────────────────────────── */}
      <div className="wizard-body">
        {sidebar}

        <div className="wizard-main">
          <div className="wizard-step-panel" key={currentStep}>
            {activeStep?.content}
          </div>

          <div className="wizard-actions">
            <button
              type="button"
              className="button secondary"
              onClick={onPrevious}
              disabled={isFirstStep}
            >
              <ChevronLeft size={14} /> Previous
            </button>

            <div className="wizard-actions-group">
              <span
                style={{
                  fontSize: "0.8rem",
                  color: "var(--text-muted)",
                  fontFamily: "var(--font-heading)",
                  letterSpacing: "0.04em",
                }}
              >
                {currentStep} / {steps.length}
              </span>

              {isLastStep ? (
                <button
                  type="button"
                  className="button primary"
                  disabled={!activeStep?.isComplete}
                  style={{
                    cursor: activeStep?.isComplete ? "pointer" : "not-allowed",
                  }}
                >
                  <CheckCircle size={14} /> Finish
                </button>
              ) : (
                <button
                  type="button"
                  className="button primary"
                  onClick={onNext}
                  disabled={!activeStep?.isComplete}
                >
                  Next <ChevronRight size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
