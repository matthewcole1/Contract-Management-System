import type {
  AuditEntry,
  Contract,
  MasterAgreement,
  Options,
} from "../types";

import { formatDateTime } from "../utils";

type ContractDetailsModalProps = {
  contract: Contract | null;
  editMode: boolean;
  isSaving: boolean;

  history: AuditEntry[];
  options: Options | null;
  masterAgreements: MasterAgreement[];

  kchNumber: string;
  institutionCompanyName: string;
  institutionContact: string;
  hospitalContact: string;
  department: string;
  contractType: string;
  requestReceived: string;
  contractStartDate: string;
  contractEndDate: string;
  contractStatus: string;
  assignedAttorney: string;
  contractManager: string;
  masterAgreementId: string;
  documentLink: string;
  notes: string;

  onKchNumberChange: (value: string) => void;
  onInstitutionCompanyNameChange: (value: string) => void;
  onInstitutionContactChange: (value: string) => void;
  onHospitalContactChange: (value: string) => void;
  onDepartmentChange: (value: string) => void;
  onContractTypeChange: (value: string) => void;
  onRequestReceivedChange: (value: string) => void;
  onContractStartDateChange: (value: string) => void;
  onContractEndDateChange: (value: string) => void;
  onContractStatusChange: (value: string) => void;
  onAssignedAttorneyChange: (value: string) => void;
  onContractManagerChange: (value: string) => void;
  onMasterAgreementIdChange: (value: string) => void;
  onDocumentLinkChange: (value: string) => void;
  onNotesChange: (value: string) => void;

  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onClose: () => void;
};

function ContractDetailsModal({
  contract,
  editMode,
  isSaving,
  history,
  options,
  masterAgreements,

  kchNumber,
  institutionCompanyName,
  institutionContact,
  hospitalContact,
  department,
  contractType,
  requestReceived,
  contractStartDate,
  contractEndDate,
  contractStatus,
  assignedAttorney,
  contractManager,
  masterAgreementId,
  documentLink,
  notes,

  onKchNumberChange,
  onInstitutionCompanyNameChange,
  onInstitutionContactChange,
  onHospitalContactChange,
  onDepartmentChange,
  onContractTypeChange,
  onRequestReceivedChange,
  onContractStartDateChange,
  onContractEndDateChange,
  onContractStatusChange,
  onAssignedAttorneyChange,
  onContractManagerChange,
  onMasterAgreementIdChange,
  onDocumentLinkChange,
  onNotesChange,

  onEdit,
  onSave,
  onCancel,
  onClose,
}: ContractDetailsModalProps) {
  if (!contract) {
    return null;
  }

  return (
    <div className="modal-backdrop">
      <div className="modal contract-modal">
        <h2>Contract Details</h2>

        <p>
          <strong>KCH #:</strong>{" "}
          {editMode ? (
            <input
              value={kchNumber}
              onChange={(event) =>
                onKchNumberChange(event.target.value)
              }
            />
          ) : (
            contract.kch_number
          )}
        </p>

        <p>
          <strong>Institution / Company:</strong>{" "}
          {editMode ? (
            <input
              value={institutionCompanyName}
              onChange={(event) =>
                onInstitutionCompanyNameChange(
                  event.target.value
                )
              }
            />
          ) : (
            contract.institution_company_name
          )}
        </p>

        <p>
          <strong>Institution Contact:</strong>{" "}
          {editMode ? (
            <input
              value={institutionContact}
              onChange={(event) =>
                onInstitutionContactChange(
                  event.target.value
                )
              }
            />
          ) : (
            contract.institution_contact || "—"
          )}
        </p>

        <p>
          <strong>Hospital Contact:</strong>{" "}
          {editMode ? (
            <input
              value={hospitalContact}
              onChange={(event) =>
                onHospitalContactChange(
                  event.target.value
                )
              }
            />
          ) : (
            contract.hospital_contact || "—"
          )}
        </p>

        <p>
          <strong>Department:</strong>{" "}
          {editMode ? (
            <select
              value={department}
              onChange={(event) =>
                onDepartmentChange(event.target.value)
              }
            >
              {options?.departments.map((item) => (
                <option
                  key={item.id}
                  value={item.name}
                >
                  {item.name}
                </option>
              ))}
            </select>
          ) : (
            contract.department
          )}
        </p>

        <p>
          <strong>Contract Type:</strong>{" "}
          {editMode ? (
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
          ) : (
            contract.contract_type
          )}
        </p>

        <p>
          <strong>Request Received:</strong>{" "}
          {editMode ? (
            <input
              type="date"
              value={requestReceived}
              onChange={(event) =>
                onRequestReceivedChange(
                  event.target.value
                )
              }
            />
          ) : (
            contract.request_received || "—"
          )}
        </p>

        <p>
          <strong>Contract Start Date:</strong>{" "}
          {editMode ? (
            <input
              type="date"
              value={contractStartDate}
              onChange={(event) =>
                onContractStartDateChange(
                  event.target.value
                )
              }
            />
          ) : (
            contract.contract_start_date || "—"
          )}
        </p>

        <p>
          <strong>Contract End Date:</strong>{" "}
          {editMode ? (
            <input
              type="date"
              value={contractEndDate}
              onChange={(event) =>
                onContractEndDateChange(
                  event.target.value
                )
              }
            />
          ) : (
            contract.contract_end_date || "—"
          )}
        </p>

        <p>
          <strong>Status:</strong>{" "}
          {editMode ? (
            <select
              value={contractStatus}
              onChange={(event) =>
                onContractStatusChange(
                  event.target.value
                )
              }
            >
              {options?.contract_statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          ) : (
            contract.contract_status
          )}
        </p>

        <p>
          <strong>Assigned Attorney:</strong>{" "}
          {editMode ? (
            <input
              value={assignedAttorney}
              onChange={(event) =>
                onAssignedAttorneyChange(
                  event.target.value
                )
              }
            />
          ) : (
            contract.assigned_attorney || "—"
          )}
        </p>

        <p>
          <strong>Contract Manager:</strong>{" "}
          {editMode ? (
            <input
              value={contractManager}
              onChange={(event) =>
                onContractManagerChange(
                  event.target.value
                )
              }
            />
          ) : (
            contract.contract_manager || "—"
          )}
        </p>

        <p>
          <strong>Master Agreement:</strong>{" "}
          {editMode ? (
            <select
              value={masterAgreementId}
              onChange={(event) =>
                onMasterAgreementIdChange(
                  event.target.value
                )
              }
            >
              <option value="">
                No Master Agreement
              </option>

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
          ) : contract.master_agreement_id ? (
            masterAgreements.find(
              (agreement) =>
                agreement.id ===
                contract.master_agreement_id
            )?.agreement_number ?? "—"
          ) : (
            "—"
          )}
        </p>

        <p>
          <strong>Document Link:</strong>{" "}
          {editMode ? (
            <input
              value={documentLink}
              onChange={(event) =>
                onDocumentLinkChange(
                  event.target.value
                )
              }
            />
          ) : contract.document_link ? (
            <a
              href={contract.document_link}
              target="_blank"
              rel="noreferrer"
            >
              Open
            </a>
          ) : (
            "—"
          )}
        </p>

        <p>
          <strong>Notes:</strong>
        </p>

        {editMode ? (
          <textarea
            value={notes}
            onChange={(event) =>
              onNotesChange(event.target.value)
            }
            rows={4}
          />
        ) : (
          <p>{contract.notes || "—"}</p>
        )}

        <p>
          <strong>Created At:</strong>{" "}
          {formatDateTime(contract.created_at)}
        </p>

        <p>
          <strong>Updated At:</strong>{" "}
          {formatDateTime(contract.updated_at)}
        </p>

        <h3>Audit History</h3>

        {history.length === 0 ? (
          <p>No history available.</p>
        ) : (
          <div className="contract-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Field</th>
                  <th>Old Value</th>
                  <th>New Value</th>
                  <th>Performed By</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {history.map((entry) => (
                  <tr key={entry.id}>
                    <td>{entry.action}</td>
                    <td>{entry.field_name || "—"}</td>
                    <td>{entry.old_value || "—"}</td>
                    <td>{entry.new_value || "—"}</td>
                    <td>{entry.performed_by}</td>
                    <td>
                      {formatDateTime(entry.performed_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!editMode ? (
          <button
            type="button"
            onClick={onEdit}
          >
            Edit Contract
          </button>
        ) : (
          <>
            <button
              type="button"
              disabled={isSaving}
              onClick={onSave}
            >
              {isSaving
                ? "Saving..."
                : "Save Changes"}
            </button>

            <button
              type="button"
              disabled={isSaving}
              onClick={onCancel}
            >
              Cancel
            </button>
          </>
        )}

        <button
          type="button"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default ContractDetailsModal;