type CreateMasterAgreementModalProps = {
  isOpen: boolean;
  isCreating: boolean;

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

  onCreate: () => void;
  onClose: () => void;
};

function CreateMasterAgreementModal({
  isOpen,
  isCreating,
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
  onCreate,
  onClose,
}: CreateMasterAgreementModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-backdrop">
      <div className="modal contract-modal">
        <h2>Create Master Agreement</h2>

        <div className="contract-form-grid">
          <label>
            Agreement #
            <input
              type="text"
              value={agreementNumber}
              onChange={(event) =>
                onAgreementNumberChange(event.target.value)
              }
            />
          </label>

          <label>
            School / Institution
            <input
              type="text"
              value={institution}
              onChange={(event) =>
                onInstitutionChange(event.target.value)
              }
            />
          </label>

          <label>
            Agreement Date
            <input
              type="date"
              value={agreementDate}
              onChange={(event) =>
                onAgreementDateChange(event.target.value)
              }
            />
          </label>

          <label>
            End Date
            <input
              type="date"
              value={endDate}
              onChange={(event) =>
                onEndDateChange(event.target.value)
              }
            />
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
              : "Create Master Agreement"}
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

export default CreateMasterAgreementModal;