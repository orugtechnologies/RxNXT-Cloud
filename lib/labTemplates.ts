// lib/labTemplates.ts
// Standard clinical laboratory templates, reference ranges, and abnormal result evaluation

export type LabTemplateType =
  | 'CBC'
  | 'WIDAL'
  | 'DENGUE'
  | 'RBS'
  | 'LFT'
  | 'KFT'
  | 'CRP'
  | 'URINE_RE'
  | 'CHEST_XRAY'
  | 'ECG'
  | 'CUSTOM';

export type LabCategory = 'BLOOD' | 'URINE' | 'IMAGING' | 'OTHER';

export type ResultFlag = 'NORMAL' | 'HIGH' | 'LOW' | 'ABNORMAL' | 'POSITIVE' | 'REACTIVE';

export interface LabParameterDefinition {
  id: string;
  name: string;
  unit: string;
  type: 'number' | 'text' | 'select';
  options?: string[];
  referenceRange?: string;
  min?: number;
  max?: number;
  defaultValue?: string;
  genderSpecific?: {
    M: { min: number; max: number; range: string };
    F: { min: number; max: number; range: string };
  };
}

export interface LabTestTemplate {
  type: LabTemplateType;
  name: string;
  category: LabCategory;
  description: string;
  parameters: LabParameterDefinition[];
  defaultImpression?: string;
}

export interface LabParameterResult {
  id: string;
  name: string;
  value: string;
  unit: string;
  referenceRange: string;
  isAbnormal: boolean;
  flag: ResultFlag;
}

export const LAB_TEMPLATES: Record<LabTemplateType, LabTestTemplate> = {
  CBC: {
    type: 'CBC',
    name: 'Complete Blood Count (CBC)',
    category: 'BLOOD',
    description: 'Comprehensive evaluation of cellular blood components including erythrocytes, leukocytes, and platelets.',
    parameters: [
      {
        id: 'hb',
        name: 'Hemoglobin (Hb)',
        unit: 'g/dL',
        type: 'number',
        genderSpecific: {
          M: { min: 13.0, max: 17.0, range: '13.0 - 17.0' },
          F: { min: 12.0, max: 15.0, range: '12.0 - 15.0' },
        },
        min: 12.0,
        max: 17.0,
        referenceRange: '12.0 - 17.0 g/dL',
      },
      {
        id: 'rbc',
        name: 'Total RBC Count',
        unit: 'mil/cu.mm',
        type: 'number',
        min: 4.5,
        max: 5.5,
        referenceRange: '4.5 - 5.5 mil/cu.mm',
      },
      {
        id: 'tlc',
        name: 'Total Leukocyte Count (TLC / WBC)',
        unit: 'cells/cu.mm',
        type: 'number',
        min: 4000,
        max: 11000,
        referenceRange: '4,000 - 11,000 /cu.mm',
      },
      {
        id: 'neutrophils',
        name: 'Neutrophils',
        unit: '%',
        type: 'number',
        min: 40,
        max: 75,
        referenceRange: '40 - 75 %',
      },
      {
        id: 'lymphocytes',
        name: 'Lymphocytes',
        unit: '%',
        type: 'number',
        min: 20,
        max: 45,
        referenceRange: '20 - 45 %',
      },
      {
        id: 'eosinophils',
        name: 'Eosinophils',
        unit: '%',
        type: 'number',
        min: 1,
        max: 6,
        referenceRange: '1 - 6 %',
      },
      {
        id: 'monocytes',
        name: 'Monocytes',
        unit: '%',
        type: 'number',
        min: 2,
        max: 10,
        referenceRange: '2 - 10 %',
      },
      {
        id: 'basophils',
        name: 'Basophils',
        unit: '%',
        type: 'number',
        min: 0,
        max: 1,
        referenceRange: '0 - 1 %',
      },
      {
        id: 'platelets',
        name: 'Platelet Count',
        unit: 'lakhs/cu.mm',
        type: 'number',
        min: 1.5,
        max: 4.5,
        referenceRange: '1.50 - 4.50 lakhs/cu.mm',
      },
      {
        id: 'pcv',
        name: 'Packed Cell Volume (PCV / Hematocrit)',
        unit: '%',
        type: 'number',
        min: 36,
        max: 50,
        referenceRange: '36 - 50 %',
      },
      {
        id: 'mcv',
        name: 'Mean Corpuscular Volume (MCV)',
        unit: 'fL',
        type: 'number',
        min: 80,
        max: 100,
        referenceRange: '80 - 100 fL',
      },
      {
        id: 'mch',
        name: 'Mean Corpuscular Hemoglobin (MCH)',
        unit: 'pg',
        type: 'number',
        min: 27,
        max: 32,
        referenceRange: '27 - 32 pg',
      },
      {
        id: 'mchc',
        name: 'MCHC',
        unit: 'g/dL',
        type: 'number',
        min: 32,
        max: 36,
        referenceRange: '32 - 36 g/dL',
      },
    ],
    defaultImpression: 'Parameters within normal biological variation.',
  },

  WIDAL: {
    type: 'WIDAL',
    name: 'Widal / Typhidot Test',
    category: 'BLOOD',
    description: 'Serological test for enteric fever (Salmonella enterica serotypes Typhi and Paratyphi).',
    parameters: [
      {
        id: 'typhi_o',
        name: "S. Typhi 'O' Antigen Titre",
        unit: '',
        type: 'select',
        options: ['< 1:20', '1:20', '1:40', '1:80', '1:160', '1:320', '> 1:320'],
        defaultValue: '< 1:20',
        referenceRange: '< 1:80 (Negative)',
      },
      {
        id: 'typhi_h',
        name: "S. Typhi 'H' Antigen Titre",
        unit: '',
        type: 'select',
        options: ['< 1:20', '1:20', '1:40', '1:80', '1:160', '1:320', '> 1:320'],
        defaultValue: '< 1:20',
        referenceRange: '< 1:80 (Negative)',
      },
      {
        id: 'paratyphi_ah',
        name: "S. Paratyphi 'AH' Titre",
        unit: '',
        type: 'select',
        options: ['< 1:20', '1:20', '1:40', '1:80', '1:160'],
        defaultValue: '< 1:20',
        referenceRange: '< 1:80',
      },
      {
        id: 'paratyphi_bh',
        name: "S. Paratyphi 'BH' Titre",
        unit: '',
        type: 'select',
        options: ['< 1:20', '1:20', '1:40', '1:80', '1:160'],
        defaultValue: '< 1:20',
        referenceRange: '< 1:80',
      },
      {
        id: 'typhidot_igm',
        name: 'Typhidot Rapid IgM Antibody',
        unit: '',
        type: 'select',
        options: ['Negative', 'Positive'],
        defaultValue: 'Negative',
        referenceRange: 'Negative',
      },
      {
        id: 'typhidot_igg',
        name: 'Typhidot Rapid IgG Antibody',
        unit: '',
        type: 'select',
        options: ['Negative', 'Positive'],
        defaultValue: 'Negative',
        referenceRange: 'Negative',
      },
    ],
    defaultImpression: 'No significant titre elevation observed. Seronegative for acute enteric fever.',
  },

  DENGUE: {
    type: 'DENGUE',
    name: 'Dengue NS1 Antigen & Antibodies',
    category: 'BLOOD',
    description: 'Rapid immunochromatographic assay for early Dengue NS1 antigen and IgM/IgG antibodies.',
    parameters: [
      {
        id: 'dengue_ns1',
        name: 'Dengue NS1 Antigen',
        unit: '',
        type: 'select',
        options: ['Non-Reactive (Negative)', 'Reactive (Positive)'],
        defaultValue: 'Non-Reactive (Negative)',
        referenceRange: 'Non-Reactive',
      },
      {
        id: 'dengue_igm',
        name: 'Dengue IgM Antibodies (Primary Infection)',
        unit: '',
        type: 'select',
        options: ['Negative', 'Positive', 'Equivocal'],
        defaultValue: 'Negative',
        referenceRange: 'Negative',
      },
      {
        id: 'dengue_igg',
        name: 'Dengue IgG Antibodies (Secondary Infection)',
        unit: '',
        type: 'select',
        options: ['Negative', 'Positive', 'Equivocal'],
        defaultValue: 'Negative',
        referenceRange: 'Negative',
      },
    ],
    defaultImpression: 'Non-reactive for Dengue viral infection.',
  },

  RBS: {
    type: 'RBS',
    name: 'Random Blood Sugar (RBS)',
    category: 'BLOOD',
    description: 'Quantitative measurement of glucose in blood at a non-standardized time.',
    parameters: [
      {
        id: 'blood_glucose',
        name: 'Random Blood Glucose',
        unit: 'mg/dL',
        type: 'number',
        min: 70,
        max: 140,
        referenceRange: '70 - 140 mg/dL (Normal: < 140, Impaired: 140-199, Diabetic: >= 200)',
      },
      {
        id: 'sample_type',
        name: 'Sample Source',
        unit: '',
        type: 'select',
        options: ['Venous Fluoride Plasma', 'Capillary Whole Blood (Glucometer)'],
        defaultValue: 'Venous Fluoride Plasma',
        referenceRange: 'Standard method',
      },
    ],
    defaultImpression: 'Normoglycemic range at time of sampling.',
  },

  LFT: {
    type: 'LFT',
    name: 'Liver Function Test (LFT)',
    category: 'BLOOD',
    description: 'Hepatic profile assessing hepatocellular integrity, cholestasis, and protein synthesis.',
    parameters: [
      {
        id: 'bili_total',
        name: 'Serum Bilirubin - Total',
        unit: 'mg/dL',
        type: 'number',
        min: 0.2,
        max: 1.2,
        referenceRange: '0.2 - 1.2 mg/dL',
      },
      {
        id: 'bili_direct',
        name: 'Serum Bilirubin - Direct (Conjugated)',
        unit: 'mg/dL',
        type: 'number',
        min: 0.0,
        max: 0.3,
        referenceRange: '0.0 - 0.3 mg/dL',
      },
      {
        id: 'bili_indirect',
        name: 'Serum Bilirubin - Indirect',
        unit: 'mg/dL',
        type: 'number',
        min: 0.2,
        max: 0.9,
        referenceRange: '0.2 - 0.9 mg/dL',
      },
      {
        id: 'sgot',
        name: 'SGOT / AST (Aspartate Aminotransferase)',
        unit: 'U/L',
        type: 'number',
        min: 5,
        max: 40,
        referenceRange: '5 - 40 U/L',
      },
      {
        id: 'sgpt',
        name: 'SGPT / ALT (Alanine Aminotransferase)',
        unit: 'U/L',
        type: 'number',
        min: 7,
        max: 56,
        referenceRange: '7 - 56 U/L',
      },
      {
        id: 'alp',
        name: 'Alkaline Phosphatase (ALP)',
        unit: 'U/L',
        type: 'number',
        min: 44,
        max: 147,
        referenceRange: '44 - 147 U/L',
      },
      {
        id: 'tp',
        name: 'Total Protein',
        unit: 'g/dL',
        type: 'number',
        min: 6.0,
        max: 8.3,
        referenceRange: '6.0 - 8.3 g/dL',
      },
      {
        id: 'albumin',
        name: 'Serum Albumin',
        unit: 'g/dL',
        type: 'number',
        min: 3.5,
        max: 5.0,
        referenceRange: '3.5 - 5.0 g/dL',
      },
      {
        id: 'globulin',
        name: 'Serum Globulin',
        unit: 'g/dL',
        type: 'number',
        min: 2.0,
        max: 3.5,
        referenceRange: '2.0 - 3.5 g/dL',
      },
      {
        id: 'ag_ratio',
        name: 'Albumin / Globulin (A/G) Ratio',
        unit: '',
        type: 'number',
        min: 1.2,
        max: 2.2,
        referenceRange: '1.2 - 2.2',
      },
    ],
    defaultImpression: 'Hepatic enzymes and synthetic protein profile within normal clinical parameters.',
  },

  KFT: {
    type: 'KFT',
    name: 'Kidney Function Test (KFT / RFT)',
    category: 'BLOOD',
    description: 'Renal panel evaluating glomerular filtration and serum electrolytes.',
    parameters: [
      {
        id: 'urea',
        name: 'Blood Urea',
        unit: 'mg/dL',
        type: 'number',
        min: 15,
        max: 45,
        referenceRange: '15 - 45 mg/dL',
      },
      {
        id: 'creatinine',
        name: 'Serum Creatinine',
        unit: 'mg/dL',
        type: 'number',
        min: 0.6,
        max: 1.2,
        referenceRange: '0.6 - 1.2 mg/dL',
      },
      {
        id: 'bun',
        name: 'Blood Urea Nitrogen (BUN)',
        unit: 'mg/dL',
        type: 'number',
        min: 7,
        max: 20,
        referenceRange: '7 - 20 mg/dL',
      },
      {
        id: 'uric_acid',
        name: 'Serum Uric Acid',
        unit: 'mg/dL',
        type: 'number',
        min: 3.5,
        max: 7.2,
        referenceRange: '3.5 - 7.2 mg/dL',
      },
      {
        id: 'sodium',
        name: 'Serum Sodium (Na+)',
        unit: 'mEq/L',
        type: 'number',
        min: 135,
        max: 145,
        referenceRange: '135 - 145 mEq/L',
      },
      {
        id: 'potassium',
        name: 'Serum Potassium (K+)',
        unit: 'mEq/L',
        type: 'number',
        min: 3.5,
        max: 5.0,
        referenceRange: '3.5 - 5.0 mEq/L',
      },
      {
        id: 'chloride',
        name: 'Serum Chloride (Cl-)',
        unit: 'mEq/L',
        type: 'number',
        min: 98,
        max: 107,
        referenceRange: '98 - 107 mEq/L',
      },
    ],
    defaultImpression: 'Normal renal function and electrolyte balance.',
  },

  CRP: {
    type: 'CRP',
    name: 'C-Reactive Protein (CRP) Quantitative',
    category: 'BLOOD',
    description: 'Acute phase inflammatory biomarker synthesized by liver in response to IL-6.',
    parameters: [
      {
        id: 'crp_val',
        name: 'CRP Concentration',
        unit: 'mg/L',
        type: 'number',
        min: 0,
        max: 6.0,
        referenceRange: '< 6.0 mg/L (Normal), 6-10 (Mild), > 10 (Clinically Significant)',
      },
    ],
    defaultImpression: 'No elevated inflammatory response detected.',
  },

  URINE_RE: {
    type: 'URINE_RE',
    name: 'Urine Routine & Microscopic Examination',
    category: 'URINE',
    description: 'Physical, chemical, and microscopic examination of clean-catch midstream urine sample.',
    parameters: [
      {
        id: 'u_color',
        name: 'Color',
        unit: '',
        type: 'select',
        options: ['Pale Yellow', 'Straw', 'Amber', 'Reddish', 'Dark Brown', 'Turbid'],
        defaultValue: 'Pale Yellow',
        referenceRange: 'Pale Yellow / Straw',
      },
      {
        id: 'u_appearance',
        name: 'Appearance / Transparency',
        unit: '',
        type: 'select',
        options: ['Clear', 'Hazy', 'Turbid', 'Cloudy'],
        defaultValue: 'Clear',
        referenceRange: 'Clear',
      },
      {
        id: 'u_sp_gravity',
        name: 'Specific Gravity',
        unit: '',
        type: 'number',
        min: 1.005,
        max: 1.030,
        referenceRange: '1.005 - 1.030',
        defaultValue: '1.015',
      },
      {
        id: 'u_ph',
        name: 'Reaction (pH)',
        unit: '',
        type: 'number',
        min: 4.5,
        max: 8.0,
        referenceRange: '4.5 - 8.0',
        defaultValue: '6.0',
      },
      {
        id: 'u_protein',
        name: 'Protein (Albumin)',
        unit: '',
        type: 'select',
        options: ['Nil (Negative)', 'Trace', '1+ (+)', '2+ (++)', '3+ (+++)'],
        defaultValue: 'Nil (Negative)',
        referenceRange: 'Nil',
      },
      {
        id: 'u_sugar',
        name: 'Glucose (Sugar)',
        unit: '',
        type: 'select',
        options: ['Nil (Negative)', 'Trace', '1+ (0.5%)', '2+ (1.0%)', '3+ (2.0%)'],
        defaultValue: 'Nil (Negative)',
        referenceRange: 'Nil',
      },
      {
        id: 'u_ketones',
        name: 'Ketone Bodies (Acetone)',
        unit: '',
        type: 'select',
        options: ['Negative', 'Trace', 'Positive (+)'],
        defaultValue: 'Negative',
        referenceRange: 'Negative',
      },
      {
        id: 'u_bile_salts',
        name: 'Bile Salts / Bile Pigments',
        unit: '',
        type: 'select',
        options: ['Negative', 'Positive (+)'],
        defaultValue: 'Negative',
        referenceRange: 'Negative',
      },
      {
        id: 'u_pus_cells',
        name: 'Pus Cells (WBCs)',
        unit: '/HPF',
        type: 'text',
        defaultValue: '1 - 2',
        referenceRange: '0 - 5 /HPF',
      },
      {
        id: 'u_rbcs',
        name: 'Red Blood Cells (RBCs)',
        unit: '/HPF',
        type: 'text',
        defaultValue: 'Nil',
        referenceRange: '0 - 2 /HPF',
      },
      {
        id: 'u_epithelial',
        name: 'Epithelial Cells',
        unit: '/HPF',
        type: 'text',
        defaultValue: 'Occasional',
        referenceRange: '0 - 5 /HPF',
      },
      {
        id: 'u_casts',
        name: 'Casts',
        unit: '',
        type: 'text',
        defaultValue: 'Nil',
        referenceRange: 'Nil',
      },
      {
        id: 'u_crystals',
        name: 'Crystals',
        unit: '',
        type: 'text',
        defaultValue: 'Nil',
        referenceRange: 'Nil',
      },
      {
        id: 'u_bacteria',
        name: 'Bacteria',
        unit: '',
        type: 'select',
        options: ['Absent', 'Few', 'Moderate', 'Plenty'],
        defaultValue: 'Absent',
        referenceRange: 'Absent',
      },
    ],
    defaultImpression: 'No proteinuria, glycosuria, or active urinary sediment detected.',
  },

  CHEST_XRAY: {
    type: 'CHEST_XRAY',
    name: 'Chest X-Ray PA View',
    category: 'IMAGING',
    description: 'Posteroanterior radiographic evaluation of pulmonary fields and cardiothoracic structures.',
    parameters: [
      {
        id: 'cxr_lungs',
        name: 'Lung Fields',
        unit: '',
        type: 'text',
        defaultValue: 'Clear. Normal bronchovascular markings. No focal consolidation, pneumothorax, or active parenchymal lesion seen.',
        referenceRange: 'Clear lung fields bilaterally',
      },
      {
        id: 'cxr_heart',
        name: 'Heart & Mediastinum',
        unit: '',
        type: 'text',
        defaultValue: 'Normal cardiac silhouette and CTR (< 0.50). Mediastinum central.',
        referenceRange: 'Normal cardiothoracic ratio',
      },
      {
        id: 'cxr_angles',
        name: 'Costophrenic & Cardiophrenic Angles',
        unit: '',
        type: 'text',
        defaultValue: 'Both CP angles are acute and clear. No blunting or pleural effusion.',
        referenceRange: 'Clear bilateral angles',
      },
      {
        id: 'cxr_diaphragm',
        name: 'Diaphragm',
        unit: '',
        type: 'text',
        defaultValue: 'Normal domes of diaphragm with smooth contours.',
        referenceRange: 'Normal configuration',
      },
      {
        id: 'cxr_bones',
        name: 'Bony Thorax & Soft Tissues',
        unit: '',
        type: 'text',
        defaultValue: 'Thoracic cage bones and soft tissue planes appear unremarkable.',
        referenceRange: 'Intact bony thorax',
      },
    ],
    defaultImpression: 'No active cardiopulmonary disease detected on PA view.',
  },

  ECG: {
    type: 'ECG',
    name: '12-Lead Resting ECG',
    category: 'OTHER',
    description: 'Standard 12-lead electrocardiogram measuring cardiac electrical conduction and rhythm.',
    parameters: [
      {
        id: 'ecg_rate',
        name: 'Ventricular Heart Rate',
        unit: 'bpm',
        type: 'number',
        min: 60,
        max: 100,
        referenceRange: '60 - 100 bpm',
      },
      {
        id: 'ecg_rhythm',
        name: 'Rhythm',
        unit: '',
        type: 'select',
        options: ['Normal Sinus Rhythm', 'Sinus Tachycardia', 'Sinus Bradycardia', 'Atrial Fibrillation', 'Arrhythmia'],
        defaultValue: 'Normal Sinus Rhythm',
        referenceRange: 'Normal Sinus Rhythm',
      },
      {
        id: 'ecg_pr',
        name: 'PR Interval',
        unit: 'ms',
        type: 'number',
        min: 120,
        max: 200,
        referenceRange: '120 - 200 ms',
      },
      {
        id: 'ecg_qrs',
        name: 'QRS Duration',
        unit: 'ms',
        type: 'number',
        min: 60,
        max: 120,
        referenceRange: '< 120 ms',
      },
      {
        id: 'ecg_qtc',
        name: 'QTc Interval',
        unit: 'ms',
        type: 'number',
        min: 350,
        max: 450,
        referenceRange: '< 440 ms (M), < 460 ms (F)',
      },
      {
        id: 'ecg_st_t',
        name: 'ST-T Waves',
        unit: '',
        type: 'text',
        defaultValue: 'Normal ST segments and T waves throughout limb and precordial leads.',
        referenceRange: 'No acute ischemic changes',
      },
      {
        id: 'ecg_axis',
        name: 'Mean QRS Axis',
        unit: '',
        type: 'select',
        options: ['Normal Axis (-30 to +90 deg)', 'Left Axis Deviation (LAD)', 'Right Axis Deviation (RAD)'],
        defaultValue: 'Normal Axis (-30 to +90 deg)',
        referenceRange: 'Normal Axis',
      },
    ],
    defaultImpression: 'Normal 12-lead Electrocardiogram (NSR). No acute ST-T wave changes.',
  },

  CUSTOM: {
    type: 'CUSTOM',
    name: 'Custom Diagnostic Test',
    category: 'OTHER',
    description: 'Custom laboratory investigation with flexible parameter rows.',
    parameters: [
      {
        id: 'param_1',
        name: 'Observed Parameter / Finding',
        unit: '',
        type: 'text',
        referenceRange: 'As per method',
      },
    ],
    defaultImpression: 'Report reviewed and verified.',
  },
};

/**
 * Resolves appropriate LabTemplate for any doctor-prescribed test name or ID
 */
export function getTemplateForTest(testNameOrId: string): LabTestTemplate {
  const norm = testNameOrId.toLowerCase().trim();

  if (norm.includes('cbc') || norm.includes('complete blood count') || norm.includes('hemogram')) {
    return LAB_TEMPLATES.CBC;
  }
  if (norm.includes('widal') || norm.includes('typhidot') || norm.includes('enteric')) {
    return LAB_TEMPLATES.WIDAL;
  }
  if (norm.includes('dengue') || norm.includes('ns1')) {
    return LAB_TEMPLATES.DENGUE;
  }
  if (norm.includes('rbs') || norm.includes('blood sugar') || norm.includes('glucose')) {
    return LAB_TEMPLATES.RBS;
  }
  if (norm.includes('lft') || norm.includes('liver function') || norm.includes('bilirubin')) {
    return LAB_TEMPLATES.LFT;
  }
  if (norm.includes('kft') || norm.includes('rft') || norm.includes('kidney function') || norm.includes('renal')) {
    return LAB_TEMPLATES.KFT;
  }
  if (norm.includes('crp') || norm.includes('c-reactive')) {
    return LAB_TEMPLATES.CRP;
  }
  if (norm.includes('urine') || norm.includes('routine & micro')) {
    return LAB_TEMPLATES.URINE_RE;
  }
  if (norm.includes('x-ray') || norm.includes('cxr') || norm.includes('chest x ray')) {
    return LAB_TEMPLATES.CHEST_XRAY;
  }
  if (norm.includes('ecg') || norm.includes('ekg') || norm.includes('electrocardiogram')) {
    return LAB_TEMPLATES.ECG;
  }

  return {
    ...LAB_TEMPLATES.CUSTOM,
    name: testNameOrId,
  };
}

/**
 * Evaluates whether an entered parameter value falls outside normal clinical reference ranges
 */
export function evaluateParameterAbnormal(
  param: LabParameterDefinition,
  value: string | undefined | null,
  gender?: string | null
): { isAbnormal: boolean; flag: ResultFlag } {
  if (!value || !value.trim()) {
    return { isAbnormal: false, flag: 'NORMAL' };
  }

  const trimmed = value.trim();

  // 1. Numeric Range Evaluation
  if (param.type === 'number') {
    const num = parseFloat(trimmed);
    if (isNaN(num)) return { isAbnormal: false, flag: 'NORMAL' };

    let min = param.min;
    let max = param.max;

    if (param.genderSpecific && gender) {
      const gKey = gender.toUpperCase().startsWith('M') ? 'M' : 'F';
      if (param.genderSpecific[gKey]) {
        min = param.genderSpecific[gKey].min;
        max = param.genderSpecific[gKey].max;
      }
    }

    if (min !== undefined && num < min) {
      return { isAbnormal: true, flag: 'LOW' };
    }
    if (max !== undefined && num > max) {
      return { isAbnormal: true, flag: 'HIGH' };
    }
    return { isAbnormal: false, flag: 'NORMAL' };
  }

  // 2. Text / Select Categorical Evaluation
  const valLower = trimmed.toLowerCase();

  // Widal Titre abnormal check (1:80 and above considered reactive)
  if (param.id.startsWith('typhi_') || param.id.startsWith('paratyphi_')) {
    if (['1:80', '1:160', '1:320', '> 1:320'].includes(trimmed)) {
      return { isAbnormal: true, flag: 'REACTIVE' };
    }
  }

  // Positive flags
  if (
    valLower.includes('positive') ||
    valLower.includes('reactive') ||
    valLower.includes('1+') ||
    valLower.includes('2+') ||
    valLower.includes('3+') ||
    valLower.includes('trace') ||
    valLower.includes('turbid') ||
    valLower.includes('tachycardia') ||
    valLower.includes('bradycardia') ||
    valLower.includes('arrhythmia') ||
    valLower.includes('fibrillation') ||
    valLower.includes('deviation')
  ) {
    if (valLower.includes('non-reactive') || valLower.includes('negative')) {
      return { isAbnormal: false, flag: 'NORMAL' };
    }
    return { isAbnormal: true, flag: valLower.includes('reactive') ? 'REACTIVE' : 'POSITIVE' };
  }

  return { isAbnormal: false, flag: 'NORMAL' };
}

/**
 * Checks if any parameter in a test result set is abnormal
 */
export function evaluateOverallAbnormal(results: LabParameterResult[]): boolean {
  return results.some(r => r.isAbnormal);
}
