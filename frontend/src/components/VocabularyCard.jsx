import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
} from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";

const VocabularyCard = ({ item }) => {
  const [open, setOpen] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const { user } = useAuth();

  const handleClick = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setIsFlipped(false);
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleProgress = async (score) => {
    try {
      await api.post(`/vocabulary/progress/${item._id}`, { score });
      handleClose();
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };

  return (
    <>
      <Card
        onClick={handleClick}
        sx={{
          cursor: "pointer",
          minHeight: 200,
          display: "flex",
          flexDirection: "column",
          "&:hover": {
            boxShadow: 6,
          },
        }}
      >
        <CardContent>
          <Typography variant="h5" component="h2">
            {item.word}
          </Typography>
          <Typography color="textSecondary" gutterBottom>
            {item.difficulty}
          </Typography>
          <Typography variant="body2" component="p">
            {item.category}
          </Typography>
        </CardContent>
      </Card>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            {item.word}
            <Typography variant="subtitle1" color="textSecondary">
              {item.difficulty}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box
            onClick={handleFlip}
            sx={{
              cursor: "pointer",
              minHeight: 200,
              perspective: "1000px",
            }}
          >
            {isFlipped ? (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Definition:
                </Typography>
                <Typography paragraph>{item.definition}</Typography>
                {item.examples && (
                  <>
                    <Typography variant="h6" gutterBottom>
                      Examples:
                    </Typography>
                    {item.examples.map((example, index) => (
                      <Typography key={index} paragraph>
                        • {example}
                      </Typography>
                    ))}
                  </>
                )}
              </Box>
            ) : (
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                minHeight={200}
              >
                <Typography variant="h4">{item.word}</Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleProgress(0)} color="error">
            Need Practice
          </Button>
          <Button onClick={() => handleProgress(50)} color="warning">
            Getting There
          </Button>
          <Button onClick={() => handleProgress(100)} color="success">
            Mastered
          </Button>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default VocabularyCard;
