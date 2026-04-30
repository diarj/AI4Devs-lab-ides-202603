jest.mock('axios', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    isAxiosError: () => false,
  },
}));

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AddCandidatePage from '../components/candidates/AddCandidatePage';
import * as candidateService from '../services/candidateService';

describe('AddCandidatePage', () => {
  const renderPage = () =>
    render(
      <MemoryRouter initialEntries={['/candidates/new']}>
        <Routes>
          <Route path="/candidates/new" element={<AddCandidatePage />} />
        </Routes>
      </MemoryRouter>,
    );

  let createCandidateSpy: jest.SpyInstance;

  beforeEach(() => {
    createCandidateSpy = jest.spyOn(candidateService, 'createCandidate');
  });

  afterEach(() => {
    createCandidateSpy.mockRestore();
  });

  it('blocks submit when required fields are empty and shows errors', async () => {
    renderPage();

    await userEvent.click(screen.getByTestId('submit-candidate'));

    await waitFor(() => {
      expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/last name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
    expect(createCandidateSpy).not.toHaveBeenCalled();
  });

  it('blocks invalid email with a clear message', async () => {
    renderPage();

    await userEvent.type(screen.getByLabelText(/first name/i), 'Ana');
    await userEvent.type(screen.getByLabelText(/last name/i), 'Lopez');
    await userEvent.type(screen.getByLabelText(/^email/i), 'bad');
    await userEvent.tab();

    await waitFor(() => {
      expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
    });
  });

  it('shows success with candidate id after create', async () => {
    createCandidateSpy.mockResolvedValue({
      id: 'cand-uuid-1',
      firstName: 'Ana',
      lastName: 'Lopez',
      email: 'ana@example.com',
      phone: null,
      address: null,
      education: null,
      workExperience: null,
      cv: null,
      createdAt: '2026-04-28T21:00:00.000Z',
    });

    renderPage();

    await userEvent.type(screen.getByLabelText(/first name/i), 'Ana');
    await userEvent.type(screen.getByLabelText(/last name/i), 'Lopez');
    await userEvent.type(screen.getByLabelText(/^email/i), 'ana@example.com');
    await userEvent.click(screen.getByTestId('submit-candidate'));

    await waitFor(() => {
      expect(screen.getByTestId('form-success')).toBeInTheDocument();
      expect(screen.getByText(/cand-uuid-1/i)).toBeInTheDocument();
    });
  });

  it('shows friendly banner on server error and preserves typed data', async () => {
    createCandidateSpy.mockRejectedValue(
      new candidateService.CandidateSubmitError({
        kind: 'server',
        message: 'Something went wrong on our side. Please try again in a moment.',
      }),
    );

    renderPage();

    await userEvent.type(screen.getByLabelText(/first name/i), 'Ana');
    await userEvent.type(screen.getByLabelText(/last name/i), 'Lopez');
    await userEvent.type(screen.getByLabelText(/^email/i), 'ana@example.com');
    await userEvent.click(screen.getByTestId('submit-candidate'));

    await waitFor(() => {
      expect(screen.getByTestId('form-banner-error')).toHaveTextContent(/try again/i);
    });
    expect(screen.getByLabelText(/first name/i)).toHaveValue('Ana');
  });
});
