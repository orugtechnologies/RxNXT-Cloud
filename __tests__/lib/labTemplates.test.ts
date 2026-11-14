import {
  getTemplateForTest,
  evaluateParameterAbnormal,
  evaluateOverallAbnormal,
  LAB_TEMPLATES,
  LabParameterDefinition,
  LabParameterResult,
} from '@/lib/labTemplates';

describe('Lab Templates & Clinical Reference Ranges', () => {
  describe('getTemplateForTest', () => {
    it('resolves Complete Blood Count variations to CBC template', () => {
      expect(getTemplateForTest('Complete Blood Count (CBC)').type).toBe('CBC');
      expect(getTemplateForTest('CBC').type).toBe('CBC');
      expect(getTemplateForTest('Complete Hemogram').type).toBe('CBC');
    });

    it('resolves Widal / Typhidot to WIDAL template', () => {
      expect(getTemplateForTest('Widal / Typhidot Test').type).toBe('WIDAL');
      expect(getTemplateForTest('Typhidot IgM').type).toBe('WIDAL');
    });

    it('resolves Dengue Antigen to DENGUE template', () => {
      expect(getTemplateForTest('Dengue NS1 Antigen').type).toBe('DENGUE');
    });

    it('resolves Liver Function Test to LFT template', () => {
      expect(getTemplateForTest('Liver Function Test (LFT)').type).toBe('LFT');
      expect(getTemplateForTest('Serum Bilirubin Total').type).toBe('LFT');
    });

    it('resolves Kidney Function Test to KFT template', () => {
      expect(getTemplateForTest('Kidney Function Test (KFT)').type).toBe('KFT');
      expect(getTemplateForTest('Renal Function Test (RFT)').type).toBe('KFT');
    });

    it('resolves Random Blood Sugar to RBS template', () => {
      expect(getTemplateForTest('Random Blood Sugar (RBS)').type).toBe('RBS');
      expect(getTemplateForTest('Blood Glucose').type).toBe('RBS');
    });

    it('resolves Urine Routine to URINE_RE template', () => {
      expect(getTemplateForTest('Urine Routine & Micro').type).toBe('URINE_RE');
    });

    it('resolves Chest X-Ray to CHEST_XRAY template', () => {
      expect(getTemplateForTest('Chest X-Ray PA View').type).toBe('CHEST_XRAY');
    });

    it('resolves ECG to ECG template', () => {
      expect(getTemplateForTest('12-Lead Resting ECG').type).toBe('ECG');
    });

    it('falls back to CUSTOM template for unrecognized test names', () => {
      const custom = getTemplateForTest('Serum Ferritin Test');
      expect(custom.type).toBe('CUSTOM');
      expect(custom.name).toBe('Serum Ferritin Test');
    });
  });

  describe('evaluateParameterAbnormal', () => {
    const hbParam: LabParameterDefinition = {
      id: 'hb',
      name: 'Hemoglobin',
      unit: 'g/dL',
      type: 'number',
      genderSpecific: {
        M: { min: 13.0, max: 17.0, range: '13.0 - 17.0' },
        F: { min: 12.0, max: 15.0, range: '12.0 - 15.0' },
      },
      min: 12.0,
      max: 17.0,
    };

    it('evaluates normal hemoglobin correctly based on gender', () => {
      // Male 14.5 is normal
      expect(evaluateParameterAbnormal(hbParam, '14.5', 'M')).toEqual({
        isAbnormal: false,
        flag: 'NORMAL',
      });

      // Female 14.0 is normal
      expect(evaluateParameterAbnormal(hbParam, '14.0', 'F')).toEqual({
        isAbnormal: false,
        flag: 'NORMAL',
      });
    });

    it('flags low hemoglobin as LOW', () => {
      // Male 10.5 is low
      expect(evaluateParameterAbnormal(hbParam, '10.5', 'M')).toEqual({
        isAbnormal: true,
        flag: 'LOW',
      });
    });

    it('flags high hemoglobin as HIGH', () => {
      // Male 18.2 is high
      expect(evaluateParameterAbnormal(hbParam, '18.2', 'M')).toEqual({
        isAbnormal: true,
        flag: 'HIGH',
      });
    });

    it('flags Widal titres >= 1:80 as REACTIVE', () => {
      const typhiParam: LabParameterDefinition = {
        id: 'typhi_o',
        name: "S. Typhi 'O'",
        unit: '',
        type: 'select',
      };

      expect(evaluateParameterAbnormal(typhiParam, '< 1:20')).toEqual({
        isAbnormal: false,
        flag: 'NORMAL',
      });
      expect(evaluateParameterAbnormal(typhiParam, '1:160')).toEqual({
        isAbnormal: true,
        flag: 'REACTIVE',
      });
    });

    it('flags positive dengue antigen as POSITIVE/REACTIVE', () => {
      const dengueParam: LabParameterDefinition = {
        id: 'dengue_ns1',
        name: 'Dengue NS1',
        unit: '',
        type: 'select',
      };

      expect(evaluateParameterAbnormal(dengueParam, 'Non-Reactive (Negative)')).toEqual({
        isAbnormal: false,
        flag: 'NORMAL',
      });
      expect(evaluateParameterAbnormal(dengueParam, 'Reactive (Positive)')).toEqual({
        isAbnormal: true,
        flag: 'REACTIVE',
      });
    });
  });

  describe('evaluateOverallAbnormal', () => {
    it('returns false when all results are normal', () => {
      const results: LabParameterResult[] = [
        { id: '1', name: 'Hb', value: '14.0', unit: 'g/dL', referenceRange: '12-17', isAbnormal: false, flag: 'NORMAL' },
        { id: '2', name: 'RBC', value: '4.8', unit: 'mil', referenceRange: '4.5-5.5', isAbnormal: false, flag: 'NORMAL' },
      ];
      expect(evaluateOverallAbnormal(results)).toBe(false);
    });

    it('returns true when at least one result is abnormal', () => {
      const results: LabParameterResult[] = [
        { id: '1', name: 'Hb', value: '9.2', unit: 'g/dL', referenceRange: '12-17', isAbnormal: true, flag: 'LOW' },
        { id: '2', name: 'RBC', value: '4.8', unit: 'mil', referenceRange: '4.5-5.5', isAbnormal: false, flag: 'NORMAL' },
      ];
      expect(evaluateOverallAbnormal(results)).toBe(true);
    });
  });
});
