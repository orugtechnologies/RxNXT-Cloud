import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import ReceptionistDashboard from '../../app/(dashboard)/receptionist/dashboard/page';

jest.mock('lucide-react', () => {
  return new Proxy({}, {
    get: (target, prop) => {
      const Component = (props: any) => <div data-testid={`icon-${String(prop).toLowerCase()}`} {...props} />;
      return Component;
    }
  });
});

// Mock the sub-components
jest.mock('@/components/patients/PatientSearchUI', () => {
  return function MockPatientSearchUI({ onSelect, onAddNew }: any) {
    return (
      <div data-testid="patient-search-ui">
        <button data-testid="select-btn" onClick={() => onSelect({ id: 'p-1', name: 'Rohan Sharma', phone: '9876543210' })}>
          Select Patient
        </button>
        <button data-testid="add-new-btn" onClick={() => onAddNew('')}>
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
        <button data-testid="success-modal-btn" onClick={() => onSuccess({ id: 'p-2', name: 'Amit Patel', phone: '9988776655' })}>Success</button>
      </div>
    );
  };
});

jest.mock('@/components/patients/AssignDoctorModal', () => {
  return function MockAssignDoctorModal({ patient, onClose, onSuccess }: any) {
    return (
      <div data-testid="assign-doctor-modal">
        <span>Patient: {patient.name}</span>
        <button data-testid="assign-success-btn" onClick={() => onSuccess(`Assigned ${patient.name} to doctor`)}>Assign Success</button>
        <button data-testid="close-assign-btn" onClick={onClose}>Close</button>
      </div>
    );
  };
});

jest.mock('@/components/receptionist/ClinicQueue', () => {
  return function MockClinicQueue() {
    return <div data-testid="clinic-queue" />;
  };
});

describe('ReceptionistDashboard Page', () => {
  it('renders the front desk dashboard with search UI', () => {
    render(<ReceptionistDashboard />);
    
    expect(screen.getByText('Front Desk Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Register new walk-in patients or search the existing directory.')).toBeInTheDocument();
    expect(screen.getByTestId('patient-search-ui')).toBeInTheDocument();
  });

  it('opens assign doctor modal when a patient is selected', () => {
    render(<ReceptionistDashboard />);
    
    const selectBtn = screen.getByTestId('select-btn');
    fireEvent.click(selectBtn);
    
    expect(screen.getByTestId('assign-doctor-modal')).toBeInTheDocument();
    expect(screen.getByText('Patient: Rohan Sharma')).toBeInTheDocument();
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

  it('shows success message after assigning a patient to a doctor', () => {
    jest.useFakeTimers();
    render(<ReceptionistDashboard />);
    
    // Select patient to open assign modal
    const selectBtn = screen.getByTestId('select-btn');
    fireEvent.click(selectBtn);
    
    // Trigger assignment success
    const assignBtn = screen.getByTestId('assign-success-btn');
    fireEvent.click(assignBtn);
    
    // Success notification should show
    expect(screen.getByText('Assigned Rohan Sharma to doctor')).toBeInTheDocument();
    
    act(() => {
      jest.runAllTimers();
    });
    expect(screen.queryByText('Assigned Rohan Sharma to doctor')).not.toBeInTheDocument();
    jest.useRealTimers();
  });
});
