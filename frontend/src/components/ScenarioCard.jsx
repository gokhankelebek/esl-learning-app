import React, { useState } from "react";
import { Card, CardContent, Typography, Dialog, Box } from "@mui/material";
import LearningModule from "./LearningModule";

const ScenarioCard = ({ scenario }) => {
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  if (!scenario || !scenario.data) {
    return null;
  }

  // Calculate total items without showing technical levels
  const totalWords = Object.values(scenario.data.vocabulary || {}).reduce(
    (sum, words) => sum + (Array.isArray(words) ? words.length : 0),
    0
  );
  const totalPhrases = Object.values(scenario.data.phrases || {}).reduce(
    (sum, phrases) => sum + (Array.isArray(phrases) ? phrases.length : 0),
    0
  );

  return (
    <>
      <Card
        onClick={handleClick}
        sx={{
          cursor: "pointer",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          "&:hover": {
            boxShadow: 6,
            transform: "translateY(-4px)",
            transition: "transform 0.2s ease-in-out",
          },
        }}
      >
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>
            {scenario.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Category:{" "}
            {(scenario.data.category || "")
              .split("_")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ")}
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2">{totalWords} words to learn</Typography>
            <Typography variant="body2">
              {totalPhrases} useful phrases
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            minHeight: "80vh",
            maxHeight: "90vh",
          },
        }}
      >
        <LearningModule scenario={scenario} onClose={handleClose} />
      </Dialog>
    </>
  );
};

export default ScenarioCard;
