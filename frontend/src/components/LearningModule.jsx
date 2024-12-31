import React, { useState } from "react";
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Container,
  Paper,
} from "@mui/material";
import VocabularyLearning from "./VocabularyLearning";
import PhrasePractice from "./PhrasePractice";
import DialogPractice from "./DialogPractice";

const LearningModule = ({ scenario }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set());

  const steps = [
    { label: "Learn Vocabulary", description: "Master new words" },
    { label: "Practice Phrases", description: "Learn common expressions" },
    { label: "Master Dialogues", description: "Practice real conversations" },
  ];

  const handleStepComplete = (step) => {
    const newCompleted = new Set(completedSteps);
    newCompleted.add(activeStep);
    setCompletedSteps(newCompleted);

    // Automatically advance to next step after completion
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const renderCurrentStep = () => {
    switch (activeStep) {
      case 0:
        return (
          <VocabularyLearning
            vocabulary={scenario.data.vocabulary}
            scenarioTitle={scenario.title}
            onComplete={handleStepComplete}
          />
        );
      case 1:
        return (
          <PhrasePractice
            phrases={scenario.data.phrases}
            vocabulary={scenario.data.vocabulary}
            onComplete={handleStepComplete}
          />
        );
      case 2:
        return (
          <DialogPractice
            dialogues={scenario.data.dialogues}
            vocabulary={scenario.data.vocabulary}
            phrases={scenario.data.phrases}
            onComplete={handleStepComplete}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ width: "100%", p: 3 }}>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((step, index) => (
          <Step key={step.label} completed={completedSteps.has(index)}>
            <StepLabel>
              <Typography variant="subtitle1">{step.label}</Typography>
              <Typography variant="caption" color="text.secondary">
                {step.description}
              </Typography>
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ mt: 4 }}>{renderCurrentStep()}</Box>

      {completedSteps.size === steps.length && (
        <Paper
          elevation={3}
          sx={{
            p: 3,
            mt: 4,
            backgroundColor: "success.light",
            color: "success.contrastText",
            textAlign: "center",
          }}
        >
          <Typography variant="h5">
            Congratulations! You've completed all learning activities for this
            scenario.
          </Typography>
          <Typography variant="subtitle1" sx={{ mt: 1 }}>
            Keep practicing to maintain your skills!
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default LearningModule;
