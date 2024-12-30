import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  Chip,
  Paper
} from '@mui/material';

const ScenarioDetail = ({ scenario }) => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          {scenario.name}
        </Typography>
        
        <Chip 
          label={`Difficulty: ${scenario.difficulty}`}
          color="primary"
          sx={{ mb: 2 }}
        />

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Vocabulary" />
            <Tab label="Phrases" />
            <Tab label="Cultural Notes" />
          </Tabs>
        </Box>

        {/* Vocabulary Tab */}
        {activeTab === 0 && (
          <Box sx={{ p: 2 }}>
            <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle1" color="primary">A1 Level</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {scenario.vocabulary.A1.map((word, index) => (
                  <Chip key={index} label={word} variant="outlined" />
                ))}
              </Box>
            </Paper>
            
            <Paper elevation={1} sx={{ p: 2 }}>
              <Typography variant="subtitle1" color="primary">A2 Level</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {scenario.vocabulary.A2.map((word, index) => (
                  <Chip key={index} label={word} variant="outlined" />
                ))}
              </Box>
            </Paper>
          </Box>
        )}

        {/* Phrases Tab */}
        {activeTab === 1 && (
          <Box sx={{ p: 2 }}>
            <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle1" color="primary">Basic Phrases</Typography>
              <List>
                {scenario.phrases.basic.map((phrase, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={phrase} />
                  </ListItem>
                ))}
              </List>
            </Paper>

            <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle1" color="primary">Situational Phrases</Typography>
              <List>
                {scenario.phrases.situational.map((phrase, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={phrase} />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Box>
        )}

        {/* Cultural Notes Tab */}
        {activeTab === 2 && (
          <Box sx={{ p: 2 }}>
            <Paper elevation={1} sx={{ p: 2 }}>
              <Typography variant="subtitle1" color="primary">Cultural Notes</Typography>
              <List>
                {scenario.phrases.cultural.map((note, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={note} />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default ScenarioDetail;
