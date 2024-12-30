import React, { useState, useEffect } from "react";
import { Grid, Container, Typography, Box } from "@mui/material";
import VocabularyCard from "./VocabularyCard";
import api from "../services/api";

const VocabularyList = () => {
  const [vocabulary, setVocabulary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVocabulary = async () => {
      try {
        const response = await api.get("/vocabulary");
        setVocabulary(response.data.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchVocabulary();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" m={4}>
        <Typography>Loading vocabulary...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" m={4}>
        <Typography color="error">Error: {error}</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Grid container spacing={3}>
        {vocabulary.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item._id}>
            <VocabularyCard item={item} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default VocabularyList;
