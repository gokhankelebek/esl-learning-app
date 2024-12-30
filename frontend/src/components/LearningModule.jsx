import React, { useState } from "react";
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Container,
} from "@mui/material";
import VocabularyLearning from "./VocabularyLearning";
import PhrasePractice from "./PhrasePractice";
import DialogPractice from "./DialogPractice";

const steps = ["Learn Vocabulary", "Practice Phrases", "Master Dialog"];

const LearningModule = ({ scenario, onClose }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [completed, setCompleted] = useState({});

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleComplete = () => {
    const newCompleted = { ...completed };
    newCompleted[activeStep] = true;
    setCompleted(newCompleted);
    handleNext();
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <VocabularyLearning
            vocabulary={scenario.data.vocabulary}
            onComplete={handleComplete}
          />
        );
      case 1:
        return (
          <PhrasePractice
            phrases={scenario.data.phrases}
            vocabulary={scenario.data.vocabulary}
            onComplete={handleComplete}
          />
        );
      case 2:
        return (
          <DialogPractice
            dialog={scenario.data.dialog}
            onComplete={handleComplete}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ width: "100%", mt: 4 }}>
        <Stepper activeStep={activeStep}>
          {steps.map((label, index) => (
            <Step key={label} completed={completed[index]}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ mt: 4, mb: 4 }}>
          {activeStep === steps.length ? (
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h5" gutterBottom>
                Congratulations! 🎉
              </Typography>
              <Typography variant="body1" paragraph>
                You've completed the {scenario.title} scenario!
              </Typography>
              <Button onClick={onClose} variant="contained" color="primary">
                Back to Scenarios
              </Button>
            </Box>
          ) : (
            <Box>
              {renderStepContent()}
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}
              >
                <Button
                  variant="outlined"
                  disabled={activeStep === 0}
                  onClick={handleBack}
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={!completed[activeStep]}
                >
                  {activeStep === steps.length - 1 ? "Finish" : "Next"}
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default LearningModule;
