import { cn } from "@/lib/utils";

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
  showText?: boolean;
}

const ProgressIndicator = ({ currentStep, totalSteps, className = '', showText = true }: ProgressIndicatorProps) => {
  const formattedText = `Step ${currentStep} of ${totalSteps}`;

  return (
    <div 
      className={cn(
        'flex flex-col items-center gap-3 mb-6',
        className
      )}
      role="progressbar"
      aria-label={`Progress: ${formattedText}`}
      aria-valuenow={currentStep}
      aria-valuemin={1}
      aria-valuemax={totalSteps}
    >
      {/* Text Label */}
      {showText && (
        <span className="text-sm text-gray-500 font-medium">
          {formattedText}
        </span>
      )}

      {/* Progress Dots */}
      <div className="flex gap-1.5">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber <= currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <div
              key={stepNumber}
              className={cn(
                'w-2 h-2 rounded-full transition-all duration-200',
                isActive ? 'bg-blue-600 scale-110' : 'bg-gray-300 scale-100',
                isCurrent && 'ring-2 ring-blue-300 ring-offset-1'
              )}
              role="button"
            />
          );
        })}
      </div>
    </div>
  );
}

export default ProgressIndicator