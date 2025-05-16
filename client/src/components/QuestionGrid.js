import React from 'react';
import { Grid } from '@mui/material';
import QuestionCard from './QuestionCard';

export default function QuestionGrid({ questions, selectedQuestions = [], onSelectQuestion }) {
  return (
    <Grid container spacing={3}>
      {questions.map(q => (
        <Grid item xs={12} key={q._id}>
          <QuestionCard
            question={q}
            checked={selectedQuestions.includes(q._id)}
            onSelect={() => onSelectQuestion && onSelectQuestion(q._id)}
          />
        </Grid>
      ))}
    </Grid>
  );
} 