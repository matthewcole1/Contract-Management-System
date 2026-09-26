import { useEffect, useState } from "react";
import {
  getContract,
  getContractHistory,
  getContracts,
  getOptions,
  updateContract,
} from "./api";

type Contract = {
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
  legal_status: string;
  assigned_attorney: string | null;
  contract_manager: string | null;
  master_agreement_id: number | null;
  document_link: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type Options = {
  contract_statuses: string[];
  legal_statuses: string[];
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

type AuditEntry = {
  id: number;
  contract_id: number;
  action: string;
  field_name: string | null;
  old_value: string | null;
  new_value: string | null;
  performed_by: string;
  performed_at: string;
};

function formatDateTime(value: string | null) {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleString();
}


function App() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [options, setOptions] = useState<Options | null>(null);
  const [error, setError] = useState("");

  const [departmentFilter, setDepartmentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedContract, setSelectedContract] =
    useState<Contract | null>(null);

  const [history, setHistory] = useState<AuditEntry[]>([]);

  const [editMode, setEditMode] = useState(false);
  const [editLegalStatus, setEditLegalStatus] = useState("");
  const [editContractStatus, setEditContractStatus] = useState("");
  const [editAssignedAttorney, setEditAssignedAttorney] = useState("");
  const [editContractManager, setEditContractManager] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editDocumentLink, setEditDocumentLink] = useState("");
  const [editRequestReceived, setEditRequestReceived] = useState("");
  const [editContractStartDate, setEditContractStartDate] = useState("");
  const [editContractEndDate, setEditContractEndDate] = useState("");
  const [editDepartment, setEditDepartment] = useState("");
  const [editContractType, setEditContractType] = useState("");
  const [editInstitutionCompanyName, setEditInstitutionCompanyName] = useState("");
  const [editInstitutionContact, setEditInstitutionContact] = useState("");
  const [editHospitalContact, setEditHospitalContact] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const contractsData = await getContracts({
          search: searchTerm,
          department: departmentFilter,
          status: statusFilter,
        });

        const optionsData = await getOptions();

        setContracts(contractsData.contracts);
        setOptions(optionsData);
      } catch (err) {
        console.error(err);
        setError("Could not load contract data.");
      }
    }

    loadData();
  }, [searchTerm, departmentFilter, statusFilter]);

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <main>
      <h1>Kings County Hospital Contract Management</h1>

      <section>
        <h2>Contracts</h2>

        <p>Total contracts: {contracts.length}</p>

        <div className="filters">
          <label>
            Search
            <input
              type="text"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
              placeholder="KCH #, company, contact..."
            />
          </label>

          <label>
            Department
            <select
              value={departmentFilter}
              onChange={(event) =>
                setDepartmentFilter(event.target.value)
              }
            >
              <option value="">All Departments</option>

              {options?.departments.map((department) => (
                <option
                  key={department.id}
                  value={department.name}
                >
                  {department.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Status
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
            >
              <option value="">All Statuses</option>

              {options?.contract_statuses.map((status) => (
                <option
                  key={status}
                  value={status}
                >
                  {status}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="contract-table-wrapper">
          <table>
            <thead>
              <tr>
                <th>KCH #</th>
                <th>Institution / Company</th>
                <th>Department</th>
                <th>Contract Type</th>
                <th>Status</th>
                <th>Legal Status</th>
              </tr>
            </thead>

            <tbody>
              {contracts.map((contract) => (
                <tr
                  key={contract.id}
                  onClick={async () => {
                    try {
                      const contractData =
                        await getContract(contract.id);

                      const historyData =
                        await getContractHistory(contract.id);

                      setSelectedContract(
                        contractData.contract
                      );

                      setEditLegalStatus(
                      contractData.contract.legal_status
                      );

                      setEditContractStatus(
                        contractData.contract.contract_status
                      );

                      setEditAssignedAttorney(
                        contractData.contract.assigned_attorney ?? ""
                      );

                      setEditContractManager(
                        contractData.contract.contract_manager ?? ""
                      );

                      setEditNotes(
                        contractData.contract.notes ?? ""
                      );

                      setEditDocumentLink(
                        contractData.contract.document_link ?? ""
                      );

                      setEditRequestReceived(
                        contractData.contract.request_received ?? ""
                      );
                      
                      setEditContractStartDate(
                        contractData.contract.contract_start_date ?? ""
                      );

                      setEditContractEndDate(
                        contractData.contract.contract_end_date ?? ""
                      );

                      setEditDepartment(
                        contractData.contract.department
                      );

                      setEditContractType(
                        contractData.contract.contract_type
                      );

                      setEditInstitutionCompanyName(
                        contractData.contract.institution_company_name ?? ""
                      );

                      setEditInstitutionContact(
                        contractData.contract.institution_contact ?? ""
                      );

                      setEditHospitalContact(
                        contractData.contract.hospital_contact ?? ""
                      );

                      setHistory(
                        historyData.history ?? []
                      );
                    } catch (err) {
                      console.error(err);
                      setError(
                        "Could not load contract details."
                      );
                    }
                  }}
                  className="clickable-row"
                >
                  <td>{contract.kch_number}</td>
                  <td>
                    {contract.institution_company_name}
                  </td>
                  <td>{contract.department}</td>
                  <td>{contract.contract_type}</td>
                  <td>{contract.contract_status}</td>
                  <td>{contract.legal_status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {selectedContract && (
        <section className="contract-detail">
          <h2>Contract Details</h2>

          <p>
            <strong>KCH #:</strong>{" "}
            {selectedContract.kch_number}
          </p>

          <p>
            <strong>Institution / Company:</strong>{" "}

            {editMode ? (
              <input
                type="text"
                value={editInstitutionCompanyName}
                onChange={(event) =>
                  setEditInstitutionCompanyName(event.target.value)
              }
            />
          ) : (
            selectedContract.institution_company_name
          )}
          </p>

          <p>
            <strong>Institution Contact:</strong>{" "}
             {editMode ? (
              <input
                type="text"
                value={editInstitutionContact}
                onChange={(event) =>
                setEditInstitutionContact(event.target.value)
              }
              />
          ) : (
            selectedContract.institution_contact || "—"
          )}
          </p>

          <p>
            <strong>Hospital Contact:</strong>{" "}
            
            {editMode ? (
              <input
              type="text"
              value={editHospitalContact}
              onChange={(event) =>
              setEditHospitalContact(event.target.value)
            }
              />
          ) : (
            selectedContract.hospital_contact || "—"
          )}
          </p>

          <p>
            <strong>Department:</strong>{" "}
            
            {editMode ? (
              <select
              value={editDepartment}
              onChange={(event) =>
              setEditDepartment(event.target.value)
            }
              >
            {options?.departments.map((department) => (
              <option
              key={department.id}
              value={department.name}
               >
              {department.name}
              </option>
            ))}
            </select>
          ) : (
            selectedContract.department
          )}
          </p>

          <p>
            <strong>Contract Type:</strong>{" "}
            
            {editMode ? (
              <select
              value={editContractType}
              onChange={(event) =>
              setEditContractType(event.target.value)
            }
              >
            {options?.contract_types.map((type) => (
              <option key={type} value={type}>
                {type}
            </option>
            ))}
            </select>
          ) : (
            selectedContract.contract_type
          )}
          </p>

          <p>
            <strong>Request Received:</strong>{" "}

              {editMode ? (
                <input
                type="date"
                value={editRequestReceived}
                onChange={(event) =>
                setEditRequestReceived(event.target.value)
              }
                />
          ) : (
            selectedContract.request_received || "—"
          )}
          </p>

          <p>
            <strong>Contract Start Date:</strong>{" "}

          {editMode ? (
            <input
            type="date"
            value={editContractStartDate}
            onChange={(event) =>
            setEditContractStartDate(event.target.value)
          }
            />
          ) : (
            selectedContract.contract_start_date || "—"
          )}
          </p>

          <p>
            <strong>Contract End Date:</strong>{" "}

            {editMode ? (
              <input
              type="date"
              value={editContractEndDate}
              onChange={(event) =>
              setEditContractEndDate(event.target.value)
            }
              />
          ) : (
            selectedContract.contract_end_date || "—"
          )}
          </p>

          <p>
            <strong>Status:</strong>{" "}

            {editMode ? (
              <select
              value={editContractStatus}
              onChange={(event) =>
              setEditContractStatus(event.target.value)
            }
              >
              {options?.contract_statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
              </select>
          ) : (
              selectedContract.contract_status
          )}
          </p>

          <p>
            <strong>Legal Status:</strong>{" "}

              {editMode ? (
                <select
                  value={editLegalStatus}
                  onChange={(event) =>
                  setEditLegalStatus(event.target.value)
                }
              >
                {options?.legal_statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            ) : (
              selectedContract.legal_status
            )}
          </p>

          <p>
            <strong>Assigned Attorney:</strong>{" "}

              {editMode ? (
                <input
                type="text"
                value={editAssignedAttorney}
                onChange={(event) =>
                setEditAssignedAttorney(event.target.value)
              }
                />
          ) : (
            selectedContract.assigned_attorney || "—"
          )}
          </p>

          <p>
            <strong>Contract Manager:</strong>{" "}

              {editMode ? (
                <input
                type="text"
                value={editContractManager}
                onChange={(event) =>
                setEditContractManager(event.target.value)
              }
                />
          ) : (
            selectedContract.contract_manager || "—"
          )}
          </p>

          <p>
            <strong>Master Agreement ID:</strong>{" "}
            {selectedContract.master_agreement_id ?? "—"}
          </p>

          <p>
            <strong>Document Link:</strong>{" "}

              {editMode ? (
                <input
                type="text"
                value={editDocumentLink}
                onChange={(event) =>
                setEditDocumentLink(event.target.value)
              }
                />
          ) : (
            selectedContract.document_link || "—"
          )}
          </p>

          <p>
            <strong>Notes:</strong>
          </p>

          {editMode ? (
            <textarea
              value={editNotes}
              onChange={(event) =>
              setEditNotes(event.target.value)
          }
          rows={4}
            />
      ) : (
      <p>{selectedContract.notes || "—"}</p>
      )}

          <p>
            <strong>Created At:</strong>{" "}
            {formatDateTime(selectedContract.created_at)}
          </p>

          <p>
            <strong>Updated At:</strong>{" "}
            {formatDateTime(selectedContract.updated_at)}
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
                      <td>{formatDateTime(entry.performed_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!editMode ? (
            <button
              type="button"
              onClick={() => setEditMode(true)}
            >
              Edit Contract
            </button>
        ) : (
          <>
            <button
              type="button"
              onClick={async () => {
              try {
                const result = await updateContract(
                selectedContract.id,
                {
                  legal_status: editLegalStatus,
                  contract_status: editContractStatus,
                  department: editDepartment,
                  contract_type: editContractType,
                  assigned_attorney: editAssignedAttorney,
                  contract_manager: editContractManager,
                  institution_company_name: editInstitutionCompanyName,
                  institution_contact: editInstitutionContact,
                  hospital_contact: editHospitalContact,
                  document_link: editDocumentLink,
                  notes: editNotes,
                  request_received: editRequestReceived || null,
                  contract_start_date: editContractStartDate || null,
                  contract_end_date: editContractEndDate || null,
                }
              );

              setSelectedContract(result.contract);

              const historyData =
                await getContractHistory(
                  selectedContract.id
                );

              setHistory(
                historyData.history ?? []
              );

              setEditMode(false);
            } catch (err) {
              console.error(err);

              if (err instanceof Error) {
                setError(err.message);
            } else {
                setError(
                  "Could not update contract."
                );
              }
            }
          }}
        >
          Save Changes
    </button>

    <button
      type="button"
      onClick={() => {
        setEditLegalStatus(selectedContract.legal_status);
        setEditContractStatus(selectedContract.contract_status);
        setEditAssignedAttorney(selectedContract.assigned_attorney ?? "");
        setEditContractManager(selectedContract.contract_manager ?? "");
        setEditDocumentLink(selectedContract.document_link ?? "");
        setEditNotes(selectedContract.notes ?? "");

        setEditRequestReceived(selectedContract.request_received ?? "");
        setEditContractStartDate(selectedContract.contract_start_date ?? "");
        setEditContractEndDate(selectedContract.contract_end_date ?? "");

        setEditInstitutionCompanyName(selectedContract.institution_company_name);
        setEditInstitutionContact(selectedContract.institution_contact ?? "");
        setEditHospitalContact(selectedContract.hospital_contact ?? "");

        setEditMode(false);
      }}
    >
      Cancel
    </button>
  </>
)}

          <button
            type="button"
            onClick={() => {
              setSelectedContract(null);
              setHistory([]);
            }}
          >
            Close
          </button>
        </section>
      )}

      <section>
        <h2>Available Contract Types</h2>

        <ul>
          {options?.contract_types.map((type) => (
            <li key={type}>{type}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}

export default App;