import type { ReactNode } from "react";

export interface WizardStep {
  id: number;
  title: string;
  description: string;
  isComplete: boolean;
  isLocked: boolean;
  content: ReactNode;
}

interface StepWizardProps {
  steps: WizardStep[];
  currentStep: number;
  onStepChange: (step: number) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export function StepWizard({
  steps,
  currentStep,
  onStepChange,
  onNext,
  onPrevious,
}: StepWizardProps) {
  const activeStep = steps.find((step) => step.id === currentStep);

  return (
    <section className="wizard-shell">
      <header className="wizard-header">
        <p className="eyebrow">5etools Character Builder</p>
        <h1>Character Builder Wizard</h1>
        <p>
          Build step by step and export a self-contained JSON prompt ready for
          AI usage.
        </p>
      </header>

      <div className="wizard-layout">
        <ol className="wizard-steps" aria-label="Character creation steps">
          {steps.map((step) => {
            const isActive = step.id === currentStep;
            const status = step.isComplete
              ? "complete"
              : isActive
                ? "active"
                : "pending";

            return (
              <li key={step.id} className={`wizard-step wizard-step-${status}`}>
                <button
                  type="button"
                  onClick={() => onStepChange(step.id)}
                  disabled={step.isLocked}
                  aria-current={isActive ? "step" : undefined}
                >
                  <span className="wizard-step-index">{step.id}</span>
                  <span className="wizard-step-content">
                    <span className="wizard-step-title">{step.title}</span>
                    <span className="wizard-step-description">
                      {step.description}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        <div className="wizard-panel">
          <div className="wizard-step-panel">{activeStep?.content}</div>

          <div className="wizard-actions">
            <button
              type="button"
              className="button secondary"
              onClick={onPrevious}
              disabled={currentStep <= 1}
            >
              Previous
            </button>
            <button
              type="button"
              className="button primary"
              onClick={onNext}
              disabled={!activeStep?.isComplete || currentStep >= steps.length}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
