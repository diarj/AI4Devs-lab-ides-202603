jest.mock('axios', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    isAxiosError: () => false,
  },
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';

describe('App routing', () => {
  it('renders recruiter dashboard with Add Candidate action', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: /recruiter dashboard/i })).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-add-candidate')).toBeInTheDocument();
  });

  it('navigates from dashboard to add candidate page', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    );

    await userEvent.click(screen.getByTestId('dashboard-add-candidate'));

    expect(await screen.findByTestId('add-candidate-page')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /add candidate/i })).toBeInTheDocument();
  });
});
