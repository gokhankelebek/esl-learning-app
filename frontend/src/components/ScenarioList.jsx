import React, { useState, useEffect } from "react";
import { Container, Grid, Typography } from "@mui/material";
import ScenarioCard from "./ScenarioCard";
import api from "../services/api";

const ScenarioList = () => {
  const [scenarios, setScenarios] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchScenarios = async () => {
      try {
        const response = await api.get("/vocabulary/scenarios");
        setScenarios(response.data.data);
      } catch (error) {
        console.error("Error fetching scenarios:", error);
        setError(error.message);
      }
    };

    fetchScenarios();
  }, []);

  if (error) {
    return (
      <Container>
        <Typography color="error" align="center">
          Error loading scenarios: {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Grid container spacing={3} justifyContent="center">
        {scenarios.map((scenario, index) => (
          <Grid item key={index} xs={12} sm={6} md={4}>
            <ScenarioCard scenario={scenario} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default ScenarioList;
