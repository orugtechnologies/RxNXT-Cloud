import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import RecentPrescriptions from '../../components/dashboard/RecentPrescriptions';

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  FileText: () => <div data-testid="icon-filetext" />,
  Copy: () => <div data-testid="icon-copy" />,
  Eye: () => <div data-testid="icon-eye" />,
  FileDigit: () => <div data-testid="icon-filedigit" />
}));

const mockPrescriptions = [
  {
    id: 'rx-1',
    created_at: new Date().toISOString(),
    patient_id: 'p-1',
    patient_name: 'John Doe',
    patient_age: 45,
    patient_gender: 'Male',
    chief_complaint: 'Fever',
    diagnosis: 'Viral Infection',
    follow_up_date: null,
    medicine_count: 2
  }
];

describe('RecentPrescriptions Component', () => {
  const mockOnClone = jest.fn();

  beforeEach(() => {
    mockOnClone.mockClear();
  });

  it('renders the empty state when no prescriptions are provided', () => {
    render(<RecentPrescriptions prescriptions={[]} onClone={mockOnClone} />);
    
    expect(screen.getByText('No prescriptions yet')).toBeInTheDocument();
    expect(screen.getByText('Create your first prescription to see it here.')).toBeInTheDocument();
    expect(screen.getByTestId('icon-filedigit')).toBeInTheDocument();
  });

  it('renders prescriptions correctly when data is provided', () => {
    render(<RecentPrescriptions prescriptions={mockPrescriptions} onClone={mockOnClone} />);
    
    // Header should be present
    expect(screen.getByText('Recent Prescriptions')).toBeInTheDocument();
    
    // Data should be rendered
    expect(screen.getByText('John doe')).toBeInTheDocument();
    expect(screen.getByText('45 yrs, Male')).toBeInTheDocument();
    expect(screen.getByText('Viral Infection')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // Medicine count
  });

  it('calls onClone when the clone button is clicked', () => {
    render(<RecentPrescriptions prescriptions={mockPrescriptions} onClone={mockOnClone} />);
    
    const cloneButton = screen.getByTitle('Clone Prescription');
    fireEvent.click(cloneButton);
    
    expect(mockOnClone).toHaveBeenCalledTimes(1);
    expect(mockOnClone).toHaveBeenCalledWith('rx-1', 'p-1');
  });
});
