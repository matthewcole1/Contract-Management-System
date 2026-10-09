import type { MasterAgreement } from "../types";
import { formatDateTime } from "../utils";

type MasterAgreementDetailsModalProps = {
  agreement: MasterAgreement | null;
  editMode: boolean;
  isSaving: boolean;

  agreementNumber: string;
  institution: string;
  agreementDate: string;
  endDate: string;
  documentLink: string;
  notes: string;

  onAgreementNumberChange: (value: string) => void;
  onInstitutionChange: (value: string) => void;
  onAgreementDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onDocumentLinkChange: (value: string) => void;
  onNotesChange: (value: string) => void;

  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onClose: () => void;
};

function MasterAgreementDetailsModal({
  agreement,
  editMode,
  isSaving,
  agreementNumber,
  institution,
  agreementDate,
  endDate,
  documentLink,
  notes,
  onAgreementNumberChange,
  onInstitutionChange,
  onAgreementDateChange,
  onEndDateChange,
  onDocumentLinkChange,
  onNotesChange,
  onEdit,
  onSave,
  onCancel,
  onClose,
}: MasterAgreementDetailsModalProps) {
  if (!agreement) {
    return null;
  }

  return (
    <div className="modal-backdrop">
      <div className="modal contract-modal">
        <h2>Master Agreement Details</h2>

        <p>
          <strong>Agreement #:</strong>{" "}
          {editMode ? (
            <input
              type="text"
              value={agreementNumber}
              onChange={(event) =>
                onAgreementNumberChange(event.target.value)
              }
            />
          ) : (
            agreement.agreement_number
          )}
        </p>

        <p>
          <strong>School / Institution:</strong>{" "}
          {editMode ? (
            <input
              type="text"
              value={institution}
              onChange={(event) =>
                onInstitutionChange(event.target.value)
              }
            />
          ) : (
            agreement.institution_company_name
          )}
        </p>

        <p>
          <strong>Agreement Date:</strong>{" "}
          {editMode ? (
            <input
              type="date"
              value={agreementDate}
              onChange={(event) =>
                onAgreementDateChange(event.target.value)
              }
            />
          ) : (
            agreement.date || "—"
          )}
        </p>

        <p>
          <strong>End Date:</strong>{" "}
          {editMode ? (
            <input
              type="date"
              value={endDate}
              onChange={(event) =>
                onEndDateChange(event.target.value)
              }
            />
          ) : (
            agreement.end_date || "—"
          )}
        </p>

        <p>
          <strong>Document Link:</strong>{" "}
          {editMode ? (
            <input
              type="text"
              value={documentLink}
              onChange={(event) =>
                onDocumentLinkChange(event.target.value)
              }
            />
          ) : agreement.document_link ? (
            <a
              href={agreement.document_link}
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
          <p>{agreement.notes || "—"}</p>
        )}

        <p>
          <strong>Created At:</strong>{" "}
          {formatDateTime(agreement.created_at)}
        </p>

        <p>
          <strong>Updated At:</strong>{" "}
          {formatDateTime(agreement.updated_at)}
        </p>

        {!editMode ? (
          <button
            type="button"
            onClick={onEdit}
          >
            Edit Master Agreement
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

export default MasterAgreementDetailsModal;