export type Contract = {
  id: number;
  kch_number: string;
  request_received: string | null;
  institution_company_name: string;
  institution_contact: string | null;
  hospital_contact: string | null;
  department: string;
  contract_type: string;
  contract_start_date: string | null;
  contract_end_date: string | null;
  contract_status: string;
  assigned_attorney: string | null;
  contract_manager: string | null;
  master_agreement_id: number | null;
  document_link: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type MasterAgreement = {
  id: number;
  agreement_number: string;
  institution_company_name: string;
  date: string | null;
  end_date: string | null;
  document_link: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type RecordRow =
  | {
      recordType: "Contract";
      id: number;
      number: string;
      institution: string;
      department: string;
      contractType: string;
      status: string;
      date: string | null;
      original: Contract;
    }
  | {
      recordType: "Master Agreement";
      id: number;
      number: string;
      institution: string;
      department: string;
      contractType: string;
      status: string;
      date: string | null;
      original: MasterAgreement;
    };
    
export type Options = {
  contract_statuses: string[];
  contract_types: string[];
  departments: {
    id: number;
    name: string;
  }[];
  personnel: {
    id: number;
    name: string;
    role: string | null;
    department: string | null;
  }[];
};

export type AuditEntry = {
  id: number;
  contract_id: number;
  action: string;
  field_name: string | null;
  old_value: string | null;
  new_value: string | null;
  performed_by: string;
  performed_at: string;
};