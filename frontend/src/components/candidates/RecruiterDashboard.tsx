import React from 'react';
import { Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const RecruiterDashboard: React.FC = () => {
  return (
    <Container className="py-5" as="main">
      <h1 className="h3 mb-4">Recruiter dashboard</h1>
      <p className="text-muted mb-4">
        Manage candidate intake from one place. Use the primary action below to register a new candidate in the ATS.
      </p>
      <Link
        className="btn btn-primary btn-lg"
        to="/candidates/new"
        data-testid="dashboard-add-candidate"
        aria-label="Add a new candidate to the ATS"
      >
        Add Candidate
      </Link>
    </Container>
  );
};

export default RecruiterDashboard;
