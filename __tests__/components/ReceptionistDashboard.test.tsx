import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ReceptionistDashboard from '../../app/(dashboard)/receptionist/dashboard/page';

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  PhoneCall: () => <div data-testid="icon-phonecall" />
}));

// Mock the sub-components
jest.mock('@/components/patients/PatientSearchUI', () => {
  return function MockPatientSearchUI({ onSelect, onAddNew }: any) {
    return (
      <div data-testid="patient-search-ui">
        <button data-testid="select-btn" onClick={() => onSelect({ id: 'p-1', name: 'Rohan Sharma', phone: '9876543210' })}>
          Select Patient
        </button>
        <button data-testid="add-new-btn" onClick={onAddNew}>
          Add New
        </button>
      </div>
    );
  };
});

jest.mock('@/components/patients/AddPatientModal', () => {
  return function MockAddPatientModal({ onClose, onSuccess }: any) {
    return (
      <div data-testid="add-patient-modal">
        <button data-testid="close-modal-btn" onClick={onClose}>Close</button>
        <button data-testid="success-modal-btn" onClick={() => onSuccess({ id: 'p-2', name: 'Amit Patel' })}>Success</button>
      </div>
    );
  };
});

describe('ReceptionistDashboard Page', () => {
  it('renders the front desk dashboard with search UI', () => {
    render(<ReceptionistDashboard />);
    
    expect(screen.getByText('Front Desk Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Register new walk-in patients or search the existing directory.')).toBeInTheDocument();
    expect(screen.getByTestId('patient-search-ui')).toBeInTheDocument();
  });

  it('displays a success message when a patient is selected', async () => {
    jest.useFakeTimers();
    render(<ReceptionistDashboard />);
    
    const selectBtn = screen.getByTestId('select-btn');
    fireEvent.click(selectBtn);
    
    expect(screen.getByText('Selected: Rohan Sharma (9876543210)')).toBeInTheDocument();
    
    jest.runAllTimers();
    expect(screen.queryByText('Selected: Rohan Sharma (9876543210)')).not.toBeInTheDocument();
    jest.useRealTimers();
  });

  it('opens and closes the add patient modal', () => {
    render(<ReceptionistDashboard />);
    
    // Initially modal is closed
    expect(screen.queryByTestId('add-patient-modal')).not.toBeInTheDocument();
    
    // Open modal
    const addNewBtn = screen.getByTestId('add-new-btn');
    fireEvent.click(addNewBtn);
    expect(screen.getByTestId('add-patient-modal')).toBeInTheDocument();
    
    // Close modal
    const closeModalBtn = screen.getByTestId('close-modal-btn');
    fireEvent.click(closeModalBtn);
    expect(screen.queryByTestId('add-patient-modal')).not.toBeInTheDocument();
  });

  it('shows success message after successfully registering a patient', () => {
    jest.useFakeTimers();
    render(<ReceptionistDashboard />);
    
    // Open modal
    const addNewBtn = screen.getByTestId('add-new-btn');
    fireEvent.click(addNewBtn);
    
    // Trigger success
    const successBtn = screen.getByTestId('success-modal-btn');
    fireEvent.click(successBtn);
    
    // Modal should close and success message should show
    expect(screen.queryByTestId('add-patient-modal')).not.toBeInTheDocument();
    expect(screen.getByText('Successfully registered: Amit Patel')).toBeInTheDocument();
    
    jest.runAllTimers();
    expect(screen.queryByText('Successfully registered: Amit Patel')).not.toBeInTheDocument();
    jest.useRealTimers();
  });
});
