import { useState } from 'react';
import { CustomerDetailsFormValues } from '../types/freshUp.types';
import { customerDetailsSchema } from '../schemas/freshUp.schemas';

const defaultValues: CustomerDetailsFormValues = {
  fullName: '',
  mobileNumber: '',
  alternateMobileNumber: '',
  gender: '',
  paxCount: 1,
  aadhaarName: '',
  aadhaarNumber: '',
  aadhaarDistrict: '',
  aadhaarState: '',
  remarks: '',
  declarationOutsideTirupati: false,
  declarationAadhaarVerificationAccepted: false,
  declarationPayAtHotelAccepted: false,
};

export function useFreshUpBookingForm(initialPax: 1 | 2) {
  const [values, setValues] = useState<CustomerDetailsFormValues>({ ...defaultValues, paxCount: initialPax });
  const [errors, setErrors] = useState<Partial<Record<keyof CustomerDetailsFormValues, string>>>({});

  const updateField = (field: keyof CustomerDetailsFormValues, value: string | boolean | number) => {
    setValues(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const setPaxCount = (pax: 1 | 2) => {
    updateField('paxCount', pax);
  };

  const validate = () => {
    const result = customerDetailsSchema.safeParse(values);
    if (!result.success) {
      const flat = result.error.flatten().fieldErrors;
      const fieldErrors: any = {};
      Object.entries(flat).forEach(([key, val]) => {
         if (val && val.length > 0) fieldErrors[key] = val[0];
      });
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const reset = () => {
    setValues({ ...defaultValues, paxCount: initialPax });
    setErrors({});
  };

  return { values, errors, updateField, setPaxCount, validate, reset };
}
