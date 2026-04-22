import type { ReactNode } from "react";

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

  return (
    <section className="wizard-shell">
      <header className="wizard-header">
        <p className="eyebrow">5etools Character Builder</p>
        <h1>Forge Your Adventurer</h1>
        <p>
          Build step by step. Each choice shapes your character's identity.
        </p>
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
                  {step.isComplete ? "✓" : step.id}
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
              ← Previous
            </button>

            <div className="wizard-actions-group">
              <span
                style={{
                  fontSize: "0.78rem",
                  color: "var(--text-muted)",
                }}
              >
                Step {currentStep} of {steps.length}
              </span>

              {isLastStep ? (
                <button
                  type="button"
                  className="button primary"
                  disabled={!activeStep?.isComplete}
                  style={{ cursor: activeStep?.isComplete ? "pointer" : "not-allowed" }}
                >
                  ✦ Finish
                </button>
              ) : (
                <button
                  type="button"
                  className="button primary"
                  onClick={onNext}
                  disabled={!activeStep?.isComplete}
                >
                  Next →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
