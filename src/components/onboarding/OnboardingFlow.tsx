
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, ChevronRight, Code, LineChart, PlayCircle } from "lucide-react";

interface Step {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const steps: Step[] = [
  {
    id: 1,
    title: "Create your first algorithm",
    description: "Start building a trading strategy using our visual editor",
    icon: <Code className="h-8 w-8" />,
  },
  {
    id: 2,
    title: "Backtest your strategy",
    description: "Test your algorithm against historical market data",
    icon: <LineChart className="h-8 w-8" />,
  },
  {
    id: 3,
    title: "Deploy to live market",
    description: "When you're ready, deploy your algorithm to the live market",
    icon: <PlayCircle className="h-8 w-8" />,
  },
];

interface OnboardingFlowProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function OnboardingFlow({ onComplete, onSkip }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const handleNextStep = () => {
    if (currentStep < steps.length) {
      setCompletedSteps([...completedSteps, currentStep]);
      setCurrentStep(currentStep + 1);
    } else {
      setCompletedSteps([...completedSteps, currentStep]);
      onComplete();
    }
  };

  const isStepCompleted = (stepId: number) => {
    return completedSteps.includes(stepId);
  };

  const currentStepData = steps.find(step => step.id === currentStep) || steps[0];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome to AlgoTrader</CardTitle>
          <CardDescription>
            Follow these steps to get started with algorithmic trading
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              {steps.map((step) => (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center">
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center transition-colors ${
                        step.id === currentStep
                          ? "bg-primary text-primary-foreground"
                          : isStepCompleted(step.id)
                          ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100"
                          : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      {isStepCompleted(step.id) ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <span>{step.id}</span>
                      )}
                    </div>
                    <span className="text-xs mt-1 text-muted-foreground">
                      Step {step.id}
                    </span>
                  </div>
                  {step.id !== steps.length && (
                    <div className="w-16 h-[2px] bg-border" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center text-center p-4 mb-6">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              {currentStepData.icon}
            </div>
            <h3 className="text-xl font-semibold mb-2">{currentStepData.title}</h3>
            <p className="text-muted-foreground">{currentStepData.description}</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="ghost" onClick={onSkip}>
            Skip
          </Button>
          <Button onClick={handleNextStep}>
            {currentStep < steps.length ? (
              <>
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
              </>
            ) : (
              "Get Started"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
