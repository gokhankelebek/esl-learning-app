import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Dialog,
  Box,
  CardActionArea,
  Chip,
  Stack,
  LinearProgress,
  IconButton,
} from "@mui/material";
import {
  School as SchoolIcon,
  Chat as ChatIcon,
  PlayCircleOutline as PlayIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
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

  // Format category name
  const categoryName = (scenario.data.category || "")
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return (
    <>
      <Card
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          "&:hover": {
            boxShadow: 6,
            transform: "translateY(-4px)",
            transition: "all 0.2s ease-in-out",
          },
        }}
      >
        <CardActionArea onClick={handleClick} sx={{ height: "100%" }}>
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h5" component="h2" gutterBottom>
                {scenario.title}
              </Typography>

              <Box>
                <Chip
                  label={categoryName}
                  size="small"
                  color="primary"
                  sx={{ mr: 1 }}
                />
              </Box>

              <Box>
                <Stack direction="row" spacing={2} alignItems="center">
                  <SchoolIcon color="action" />
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Vocabulary Progress
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={0}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {totalWords}
                  </Typography>
                </Stack>
              </Box>

              <Box>
                <Stack direction="row" spacing={2} alignItems="center">
                  <ChatIcon color="action" />
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Phrases Progress
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={0}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {totalPhrases}
                  </Typography>
                </Stack>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                <PlayIcon color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </Stack>
          </CardContent>
        </CardActionArea>
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
            position: "relative",
          },
        }}
      >
        <IconButton
          onClick={handleClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: "grey.500",
          }}
        >
          <CloseIcon />
        </IconButton>
        <LearningModule scenario={scenario} onClose={handleClose} />
      </Dialog>
    </>
  );
};

export default ScenarioCard;
