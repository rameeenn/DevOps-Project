// src/__tests__/PatientAllInt.test.jsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, useParams } from 'react-router-dom';
import { AuthProvider } from '../components/AuthContext';
import { CartProvider } from '../components/CartContext';
import AmbulanceHomePage from '../components/AmbulanceHomePage';
import BookAppointment from '../components/BookAppointment';
import ArticlePage from '../components/ArticlePage';
import ConfirmAppointment from '../components/ConfirmAppointment';
import MedicineCheckout from '../components/MedicineCheckout';
import BookLabTest from '../components/BookLabTest';
import ArticlesHomePage from '../components/ArticlesHomePage';
import MedicineHomePage from '../components/MedicineHomePage';
import AmbulanceConfirmation from '../components/AmbulanceConfirmation';
import PatientAppointmentsHome from '../components/PatientAppointmentsHome';
import PatientProfile from '../components/PatientProfile';
import RescheduleLabTest from '../components/RescheduleLabTest';
import RescheduleAppointment from '../components/RescheduleAppointment';

// Mocks
global.fetch = jest.fn();
const mockNavigate = jest.fn();

// Mock useParams for different components
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: jest.fn(),
  useLocation: jest.fn(),
}));

// Mock sessionStorage
const sessionStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => { store[key] = value.toString(); }),
    removeItem: jest.fn(key => { delete store[key]; }),
    clear: jest.fn(() => { store = {}; }),
  };
})();

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
});

// Store original console methods
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

beforeAll(() => {
  console.log = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
});

describe('Patient Components - Integration Tests', () => {
  let user;
  beforeEach(() => {
    user = userEvent.setup();
    jest.clearAllMocks();
    fetch.mockReset();
    mockNavigate.mockReset();
    sessionStorageMock.clear();
    
    // Default patient session
    sessionStorageMock.getItem.mockImplementation((key) => {
      if (key === 'user') return JSON.stringify({ patient_id: 'P101', user_id: 'U101' });
      return null;
    });

    // Default useLocation mock
    require('react-router-dom').useLocation.mockReturnValue({ 
      search: '',
      pathname: '/test'
    });
  });

  // AmbulanceHomePage Tests
  test('renders AmbulanceHomePage and handles ambulance call', async () => {
    fetch.mockResolvedValueOnce({ 
      ok: true, 
      json: async () => ({ 
        call_id: 'C001', 
        date: '2025-01-01', 
        time: '10:00 AM'
      }) 
    });

    render(
      <BrowserRouter>
        <AuthProvider>
          <AmbulanceHomePage />
        </AuthProvider>
      </BrowserRouter>
    );

    // Find address input by placeholder
    const addressInput = screen.getByPlaceholderText(/Enter address here/i);
    await user.type(addressInput, '123 Main St');
    
    // Submit the form
    const confirmButton = screen.getByRole('button', { name: /Confirm/i });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(screen.getByText(/Your Ambulance is on the way!/i)).toBeInTheDocument();
      expect(fetch).toHaveBeenCalledTimes(1); // Additional assertion for API call
    });
  });

  // BookAppointment Tests
  test('renders BookAppointment and filters doctors', async () => {
    const mockDoctors = [
      { full_name: 'Dr. Alice', specialization: 'Cardiology', doctor_id: 'D001' },
      { full_name: 'Dr. Bob', specialization: 'Neurology', doctor_id: 'D002' },
    ];

    fetch.mockResolvedValueOnce({ ok: true, json: async () => mockDoctors });

    render(
      <BrowserRouter>
        <AuthProvider>
          <BookAppointment />
        </AuthProvider>
      </BrowserRouter>
    );

    await waitFor(() => expect(screen.getByText('Dr. Alice')).toBeInTheDocument());

    // Search for doctor
    const searchInput = screen.getByPlaceholderText(/Search for doctors/i);
    await user.type(searchInput, 'Alice');
    
    expect(screen.getByText('Dr. Alice')).toBeInTheDocument();
    expect(screen.queryByText('Dr. Bob')).not.toBeInTheDocument();
  });

  // ArticlePage Tests
  test('renders ArticlePage with specific article content', () => {
    // Mock useParams for this specific test
    require('react-router-dom').useParams.mockReturnValue({ id: '1' });

    render(
      <BrowserRouter>
        <AuthProvider>
          <ArticlePage />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByText(/The Role of Antibiotics in Treating Infections/i)).toBeInTheDocument();
    expect(screen.getByText(/Dr Rameen Rafiq/i)).toBeInTheDocument();
  });

  // ConfirmAppointment Tests
  test('renders ConfirmAppointment and handles booking', async () => {
    // Mock useParams and useLocation for ConfirmAppointment
    require('react-router-dom').useParams.mockReturnValue({ id: 'D001' });
    require('react-router-dom').useLocation.mockReturnValue({ 
      search: '?doctor=Dr.%20Test&special=Cardiology',
      pathname: '/test'
    });

    fetch.mockResolvedValueOnce({ 
      ok: true, 
      json: async () => ({ 
        start_time: '08:00:00',
        end_time: '17:00:00'
      }) 
    });

    fetch.mockResolvedValueOnce({ 
      ok: true, 
      json: async () => ({ 
        appointment_id: 'A001'
      }) 
    });

    const { container } = render(
      <BrowserRouter>
        <AuthProvider>
          <ConfirmAppointment />
        </AuthProvider>
      </BrowserRouter>
    );

    // Wait for time options to load
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    // Find and fill the form
    const dateInput = screen.queryByLabelText(/Appointment Date/i) || container.querySelector('input[type="date"]');
    await user.type(dateInput, '2025-01-01');

    const submitButton = screen.getByRole('button', { name: /Confirm Appointment/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/confirmApp',
        expect.objectContaining({ method: 'POST' })
      );
    });
  });

  // MedicineCheckout Tests
  test('renders MedicineCheckout and handles order completion', async () => {
    // Mock useLocation with cart items
    require('react-router-dom').useLocation.mockReturnValue({ 
      search: '?item=' + encodeURIComponent(JSON.stringify({ 
        id: 1, name: 'Medicine A', price: 10, quantity: 1 
      })),
      pathname: '/checkout'
    });

    fetch.mockResolvedValueOnce({ ok: true });

    render(
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <MedicineCheckout />
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    );

    const addressInput = screen.getByPlaceholderText(/Enter your address/i);
    await user.type(addressInput, '123 Main St');
    
    const completeButton = screen.getByRole('button', { name: /Complete Order/i });
    await user.click(completeButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });

  // BookLabTest Tests
  test('renders BookLabTest and handles lab test booking', async () => {
    // Mock useParams for BookLabTest
    require('react-router-dom').useParams.mockReturnValue({ id: 'P101' });

    fetch.mockResolvedValueOnce({ ok: true });

    const { container } = render(
      <BrowserRouter>
        <AuthProvider>
          <BookLabTest />
        </AuthProvider>
      </BrowserRouter>
    );

    // Find form elements
    const testTypeSelect = screen.getByDisplayValue(/Select test type/i);
    const dateInput = container.querySelector('input[type="date"]');
    const timeSelect = screen.getByDisplayValue(/Select time/i);

    await user.selectOptions(testTypeSelect, 'Blood Test');
    await user.type(dateInput, '2025-01-01');
    await user.selectOptions(timeSelect, '08:00:00');

    const submitButton = screen.getByRole('button', { name: /Book Lab Test/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/confirmtest',
        expect.objectContaining({ method: 'POST' })
      );
    });
  });

  // ArticlesHomePage Tests
  test('renders ArticlesHomePage and filters articles', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <ArticlesHomePage />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByText(/The Role of Antibiotics in Treating Infections/i)).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText(/Search for article/i);
    await user.type(searchInput, 'Stress');
    
    expect(screen.getByText(/The Impact of Stress on Mental Health/i)).toBeInTheDocument();
  });

  // MedicineHomePage Tests
  test('renders MedicineHomePage and displays medicines', async () => {
    const mockMedicines = [
      { medicine_id: 1, name: 'Paracetamol', category: 'Painkiller', description: 'Pain relief', stock: 100, price: 5 },
    ];

    fetch.mockResolvedValueOnce({ ok: true, json: async () => mockMedicines });

    render(
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <MedicineHomePage />
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    );

    await waitFor(() => expect(screen.getByText('Paracetamol')).toBeInTheDocument());
  });

  // AmbulanceConfirmation Tests
  test('renders AmbulanceConfirmation with static data', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <AmbulanceConfirmation />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByText(/Your Ambulance is on the way!/i)).toBeInTheDocument();
    expect(screen.getByText(/C1/i)).toBeInTheDocument();
  });

  // PatientAppointmentsHome Tests
  test('renders PatientAppointmentsHome and displays appointments', async () => {
    const mockAppointments = [
      { 
        appointment_id: 1, 
        appointment_date: '2025-01-01', 
        appointment_time: '10:00', 
        status: 'Scheduled',
        full_name: 'Dr. Smith'
      },
    ];

    fetch.mockResolvedValueOnce({ ok: true, json: async () => mockAppointments });

    render(
      <BrowserRouter>
        <AuthProvider>
          <PatientAppointmentsHome />
        </AuthProvider>
      </BrowserRouter>
    );

    await waitFor(() => expect(screen.getByText('2025-01-01')).toBeInTheDocument());
    expect(screen.getByText('Dr. Smith')).toBeInTheDocument();
  });

  // PatientProfile Tests
  test('renders PatientProfile and displays fetched profile', async () => {
    const mockProfile = {
      full_name: 'John Doe',
      date_of_birth: '1990-01-01',
      email: 'john@example.com',
      contact_number: '1234567890',
      status: 'Active',
    };

    fetch.mockResolvedValueOnce({ ok: true, json: async () => mockProfile });

    render(
      <BrowserRouter>
        <AuthProvider>
          <PatientProfile />
        </AuthProvider>
      </BrowserRouter>
    );

    await waitFor(() => expect(screen.getByText('John Doe')).toBeInTheDocument());
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  // RescheduleLabTest Tests
  test('renders RescheduleLabTest with correct ID', () => {
    // Mock useParams for RescheduleLabTest
    require('react-router-dom').useParams.mockReturnValue({ id: 'L001' });

    render(
      <BrowserRouter>
        <AuthProvider>
          <RescheduleLabTest />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByText(/L001/i)).toBeInTheDocument();
  });

  // RescheduleAppointment Tests
  test('renders RescheduleAppointment with correct ID', () => {
    // Mock useParams and useLocation for RescheduleAppointment
    require('react-router-dom').useParams.mockReturnValue({ id: 'A001' });
    require('react-router-dom').useLocation.mockReturnValue({ 
      search: '?doctor=Dr.%20Smith',
      pathname: '/test'
    });

    render(
      <BrowserRouter>
        <AuthProvider>
          <RescheduleAppointment />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByText(/A001/i)).toBeInTheDocument();
    expect(screen.getByText(/Dr. Smith/i)).toBeInTheDocument();
  });
});