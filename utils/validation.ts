// utils/validation.ts

export const validatePrescriptionMedicine = (medicine: any) => {
  const errors: string[] = [];

  if (!medicine.generic_name && !medicine.brand_name) {
    errors.push('Medicine name is required.');
  }

  // Rule: Do not allow saving without an explicit dosage form
  // We never default to Tablet, so if it's missing, it's an error.
  if (!medicine.dosageForm || medicine.dosageForm.trim() === '') {
    errors.push('Dosage form is required. It cannot be empty or assumed.');
  }

  if (!medicine.route || medicine.route.trim() === '') {
    errors.push('Administration route is required.');
  }

  if (!medicine.frequency) {
    errors.push('Frequency is required.');
  }

  if (!medicine.duration) {
    errors.push('Duration is required.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
