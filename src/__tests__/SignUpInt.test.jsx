// src/__tests__/SignUpInt.test.jsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import SignUpPage from '../components/SignUpPage'; // Adjust path if needed

// Mock fetch
global.fetch = jest.fn();
const mockNavigate = jest.fn();

// Mock useNavigate
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('SignUpPage Component Integration Tests', () => {
  let user;
  beforeEach(() => {
    user = userEvent.setup();
    fetch.mockClear();
    mockNavigate.mockClear();
    global.alert = jest.fn();
  });

  test('renders sign up form with all fields', () => {
    render(<BrowserRouter><SignUpPage /></BrowserRouter>);

    expect(screen.getByAltText('Healthify Logo')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Sign Up' })).toBeInTheDocument();

    expect(screen.getByText('Full Name:')).toBeInTheDocument();
    expect(screen.getByText('Email:')).toBeInTheDocument();
    expect(screen.getByText('Date of Birth:')).toBeInTheDocument();
    expect(screen.getByText('Contact Number:')).toBeInTheDocument();
    expect(screen.getByText('Password:')).toBeInTheDocument();
    expect(screen.getByText('Confirm Password:')).toBeInTheDocument();

    expect(screen.getByRole('button', { name: 'Sign Up' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
  });

  test('handles form input changes', async () => {
    render(<BrowserRouter><SignUpPage /></BrowserRouter>);

    const allInputs = screen.getAllByDisplayValue('');

    const fullNameInput = allInputs[0];
    const emailInput = allInputs[1];
    // allInputs[2] is dob (date)
    const contactInput = allInputs[3];
    const passwordInput = allInputs[4];
    const confirmPasswordInput = allInputs[5];

    await user.type(fullNameInput, 'John Doe');
    await user.type(emailInput, 'john@example.com');
    await user.type(contactInput, '1234567890');
    await user.type(passwordInput, 'secret123');
    await user.type(confirmPasswordInput, 'secret123');

    expect(fullNameInput).toHaveValue('John Doe');
    expect(emailInput).toHaveValue('john@example.com');
    expect(contactInput).toHaveValue('1234567890');
    expect(passwordInput).toHaveValue('secret123');
    expect(confirmPasswordInput).toHaveValue('secret123');
  });

  test('shows alert when passwords do not match', async () => {
    render(<BrowserRouter><SignUpPage /></BrowserRouter>);

    const allInputs = screen.getAllByDisplayValue('');
    const passwordInputs = allInputs.slice(-2); // Last two are passwords

    await user.type(passwordInputs[0], 'pass123');
    await user.type(passwordInputs[1], 'different');

    await user.click(screen.getByRole('button', { name: 'Sign Up' }));

    expect(global.alert).toHaveBeenCalledWith('Passwords do not match');
    expect(fetch).not.toHaveBeenCalled();
  });

  test('successful signup', async () => {
    fetch.mockResolvedValueOnce({
      status: 201,
      json: async () => ({ message: 'User registered successfully' }),
    });

    render(<BrowserRouter><SignUpPage /></BrowserRouter>);

    const allInputs = screen.getAllByDisplayValue('');

    await user.type(allInputs[0], 'John Doe');
    await user.type(allInputs[1], 'john@test.com');
    await user.type(allInputs[2], '1990-01-01'); // dob
    await user.type(allInputs[3], '1234567890');
    await user.type(allInputs[4], 'pass123');
    await user.type(allInputs[5], 'pass123');

    await user.click(screen.getByRole('button', { name: 'Sign Up' }));

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    expect(global.alert).toHaveBeenCalledWith('User registered successfully');
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('failed signup shows alert', async () => {
    fetch.mockResolvedValueOnce({
      status: 400,
      json: async () => ({ error: 'User already exists' }),
    });

    render(<BrowserRouter><SignUpPage /></BrowserRouter>);

    const allInputs = screen.getAllByDisplayValue('');

    await user.type(allInputs[0], 'John');
    await user.type(allInputs[1], 'j@j.com');
    await user.type(allInputs[2], '1990-01-01'); // dob
    await user.type(allInputs[3], '1234567890');
    await user.type(allInputs[4], 'pass123');
    await user.type(allInputs[5], 'pass123');

    await user.click(screen.getByRole('button', { name: 'Sign Up' }));

    await waitFor(() => expect(global.alert).toHaveBeenCalledWith('Error during signup'));
  });

  test('navigates to login page when login button is clicked', async () => {
    render(<BrowserRouter><SignUpPage /></BrowserRouter>);
    await user.click(screen.getByRole('button', { name: 'Login' }));
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});