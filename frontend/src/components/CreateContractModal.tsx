import type { MasterAgreement, Options } from "../types";

type CreateContractModalProps = {
  isOpen: boolean;
  isCreating: boolean;

  kchNumber: string;
  institutionCompanyName: string;
  department: string;
  contractType: string;
  requestReceived: string;
  institutionContact: string;
  hospitalContact: string;
  contractStartDate: string;
  contractEndDate: string;
  contractStatus: string;
  assignedAttorney: string;
  contractManager: string;
  masterAgreementId: string;
  documentLink: string;
  notes: string;

  options: Options | null;
  masterAgreements: MasterAgreement[];

  onKchNumberChange: (value: string) => void;
  onInstitutionCompanyNameChange: (value: string) => void;
  onDepartmentChange: (value: string) => void;
  onContractTypeChange: (value: string) => void;
  onRequestReceivedChange: (value: string) => void;
  onInstitutionContactChange: (value: string) => void;
  onHospitalContactChange: (value: string) => void;
  onContractStartDateChange: (value: string) => void;
  onContractEndDateChange: (value: string) => void;
  onContractStatusChange: (value: string) => void;
  onAssignedAttorneyChange: (value: string) => void;
  onContractManagerChange: (value: string) => void;
  onMasterAgreementIdChange: (value: string) => void;
  onDocumentLinkChange: (value: string) => void;
  onNotesChange: (value: string) => void;

  onCreate: () => void;
  onClose: () => void;
};

function CreateContractModal({
  isOpen,
  isCreating,
  kchNumber,
  institutionCompanyName,
  department,
  contractType,
  requestReceived,
  institutionContact,
  hospitalContact,
  contractStartDate,
  contractEndDate,
  contractStatus,
  assignedAttorney,
  contractManager,
  masterAgreementId,
  documentLink,
  notes,
  options,
  masterAgreements,
  onKchNumberChange,
  onInstitutionCompanyNameChange,
  onDepartmentChange,
  onContractTypeChange,
  onRequestReceivedChange,
  onInstitutionContactChange,
  onHospitalContactChange,
  onContractStartDateChange,
  onContractEndDateChange,
  onContractStatusChange,
  onAssignedAttorneyChange,
  onContractManagerChange,
  onMasterAgreementIdChange,
  onDocumentLinkChange,
  onNotesChange,
  onCreate,
  onClose,
}: CreateContractModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-backdrop">
      <div className="modal contract-modal">
        <h2>Create Contract</h2>

        <div className="contract-form-grid">
          <label>
            KCH #
            <input
              type="text"
              value={kchNumber}
              onChange={(event) =>
                onKchNumberChange(event.target.value)
              }
            />
          </label>

          <label>
            Institution / Company
            <input
              type="text"
              value={institutionCompanyName}
              onChange={(event) =>
                onInstitutionCompanyNameChange(event.target.value)
              }
            />
          </label>

          <label>
            Department
            <select
              value={department}
              onChange={(event) =>
                onDepartmentChange(event.target.value)
              }
            >
              <option value="">Select Department</option>

              {options?.departments.map((item) => (
                <option key={item.id} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Contract Type
            <select
              value={contractType}
              onChange={(event) =>
                onContractTypeChange(event.target.value)
              }
            >
              {options?.contract_types.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>

          <label>
            Request Received
            <input
              type="date"
              value={requestReceived}
              onChange={(event) =>
                onRequestReceivedChange(event.target.value)
              }
            />
          </label>

          <label>
            Institution Contact
            <input
              type="text"
              value={institutionContact}
              onChange={(event) =>
                onInstitutionContactChange(event.target.value)
              }
            />
          </label>

          <label>
            Hospital Contact
            <input
              type="text"
              value={hospitalContact}
              onChange={(event) =>
                onHospitalContactChange(event.target.value)
              }
            />
          </label>

          <label>
            Contract Start Date
            <input
              type="date"
              value={contractStartDate}
              onChange={(event) =>
                onContractStartDateChange(event.target.value)
              }
            />
          </label>

          <label>
            Contract End Date
            <input
              type="date"
              value={contractEndDate}
              onChange={(event) =>
                onContractEndDateChange(event.target.value)
              }
            />
          </label>

          <label>
            Contract Status
            <select
              value={contractStatus}
              onChange={(event) =>
                onContractStatusChange(event.target.value)
              }
            >
              {options?.contract_statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>

          <label>
            Assigned Attorney
            <input
              type="text"
              value={assignedAttorney}
              onChange={(event) =>
                onAssignedAttorneyChange(event.target.value)
              }
            />
          </label>

          <label>
            Contract Manager
            <input
              type="text"
              value={contractManager}
              onChange={(event) =>
                onContractManagerChange(event.target.value)
              }
            />
          </label>

          <label>
            Master Agreement
            <select
              value={masterAgreementId}
              onChange={(event) =>
                onMasterAgreementIdChange(event.target.value)
              }
            >
              <option value="">No Master Agreement</option>

              {masterAgreements.map((agreement) => (
                <option
                  key={agreement.id}
                  value={agreement.id}
                >
                  {agreement.agreement_number} —{" "}
                  {agreement.institution_company_name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Document Link
            <input
              type="text"
              value={documentLink}
              onChange={(event) =>
                onDocumentLinkChange(event.target.value)
              }
            />
          </label>

          <label>
            Notes
            <textarea
              value={notes}
              onChange={(event) =>
                onNotesChange(event.target.value)
              }
              rows={4}
            />
          </label>
        </div>

        <div className="modal-actions">
          <button
            type="button"
            disabled={isCreating}
            onClick={onCreate}
          >
            {isCreating
              ? "Creating..."
              : "Create Contract"}
          </button>

          <button
            type="button"
            disabled={isCreating}
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateContractModal;