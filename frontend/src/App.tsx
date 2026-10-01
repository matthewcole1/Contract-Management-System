import "./App.css";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  getContract,
  getContractHistory,
  getContracts,
  getOptions,
  updateContract,
  createContract,
  createMasterAgreement,
  getMasterAgreements,
  getMasterAgreement,
  updateMasterAgreement,
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
  assigned_attorney: string | null;
  contract_manager: string | null;
  master_agreement_id: number | null;
  document_link: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type MasterAgreement = {
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

type Options = {
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
  const utcValue = value.includes("T")
    ? value
    : value.replace(" ", "T") + "Z";

  return new Date(utcValue).toLocaleString();
}


function App() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [masterAgreements, setMasterAgreements] = useState<MasterAgreement[]>([]);
  const [options, setOptions] = useState<Options | null>(null);
  const [error, setError] = useState("");

  const [departmentFilter, setDepartmentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [recordTypeFilter, setRecordTypeFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedContract, setSelectedContract] =
    useState<Contract | null>(null);

  const [selectedMasterAgreement, setSelectedMasterAgreement] =
    useState<MasterAgreement | null>(null);

  const [history, setHistory] = useState<AuditEntry[]>([]);

  const [editMode, setEditMode] = useState(false);
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
  const [editKchNumber, setEditKchNumber] = useState("");
  const [editMasterAgreementId, setEditMasterAgreementId] = useState("");
  const [editMasterMode, setEditMasterMode] = useState(false);
  const [editAgreementNumber, setEditAgreementNumber] = useState("");
  const [editMasterInstitution, setEditMasterInstitution] = useState("");
  const [editAgreementDate, setEditAgreementDate] = useState("");
  const [editMasterDocumentLink, setEditMasterDocumentLink] = useState("");
  const [editMasterNotes, setEditMasterNotes] = useState("");
  const [editMasterEndDate, setEditMasterEndDate] = useState("");

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showMasterAgreementForm, setShowMasterAgreementForm] = useState(false);

  const [newKchNumber, setNewKchNumber] = useState("");
  const [newInstitutionCompanyName, setNewInstitutionCompanyName] = useState("");
  const [newDepartment, setNewDepartment] = useState("");
  const [newContractType, setNewContractType] = useState("Other");
  const [newRequestReceived, setNewRequestReceived] = useState("");
  const [newInstitutionContact, setNewInstitutionContact] = useState("");
  const [newHospitalContact, setNewHospitalContact] = useState("");
  const [newContractStartDate, setNewContractStartDate] = useState("");
  const [newContractEndDate, setNewContractEndDate] = useState("");
  const [newContractStatus, setNewContractStatus] = useState("Request Received");
  const [newAssignedAttorney, setNewAssignedAttorney] = useState("");
  const [newContractManager, setNewContractManager] = useState("");
  const [newDocumentLink, setNewDocumentLink] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [newMasterAgreementId, setNewMasterAgreementId] = useState("");
  const [newAgreementNumber, setNewAgreementNumber] = useState("");
  const [newMasterInstitution, setNewMasterInstitution] = useState("");
  const [newAgreementDate, setNewAgreementDate] = useState("");
  const [newMasterDocumentLink, setNewMasterDocumentLink] = useState("");
  const [newMasterNotes, setNewMasterNotes] = useState("");
  const [newMasterEndDate, setNewMasterEndDate] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const contractsData = await getContracts({
          search: searchTerm,
          department: departmentFilter,
          status: statusFilter,
        });

        const optionsData = await getOptions();

        const masterAgreementsData = await getMasterAgreements();

        setContracts(contractsData.contracts);
        setOptions(optionsData);
        setMasterAgreements(masterAgreementsData.master_agreements
    );
      } catch (err) {
        console.error(err);
        setError("Could not load contract data.");
      }
    }

    loadData();
  }, [searchTerm, departmentFilter, statusFilter]);

  const totalContracts = contracts.length;

const activeContracts = contracts.filter(
  (contract) => contract.contract_status === "Active"
).length;

const today = new Date();

const sixWeeksFromNow = new Date();
sixWeeksFromNow.setDate(today.getDate() + 42);

const visibleMasterAgreements = masterAgreements.filter((agreement) => {
  if (departmentFilter || statusFilter) {
    return false;
  }

  if (!searchTerm.trim()) {
    return true;
  }

  const search = searchTerm.toLowerCase();

  return (
    agreement.agreement_number
      .toLowerCase()
      .includes(search) ||
    agreement.institution_company_name
      .toLowerCase()
      .includes(search)
  );
});

const combinedRecords = [
  ...contracts.map((contract) => ({
    recordType: "Contract" as const,
    id: contract.id,
    number: contract.kch_number,
    institution: contract.institution_company_name,
    department: contract.department,
    contractType: contract.contract_type,
    status: contract.contract_status,
    date: contract.contract_start_date,
    original: contract,
  })),

  ...visibleMasterAgreements.map((agreement) => ({
    recordType: "Master Agreement" as const,
    id: agreement.id,
    number: agreement.agreement_number,
    institution: agreement.institution_company_name,
    department: "—",
    contractType: "Master Agreement",
    status: "—",
    date: agreement.date,
    original: agreement,
  })),
].filter((record) => {
  if (!recordTypeFilter) {
    return true;
  }

  return record.recordType === recordTypeFilter;
});

const startingWithinSixWeeks = contracts.filter((contract) => {
  if (!contract.contract_start_date) {
    return false;
  }

  const startDate = new Date(contract.contract_start_date);

  return startDate >= today && startDate <= sixWeeksFromNow;
}).length;

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <main>
      <Toaster position="top-right" />

      <h1>Kings County Hospital Contract Management</h1>

      <section>
        <h2>Contracts</h2>

        <div className="stats-grid">
          <div className="stat-card total">
            <p>Total Contracts</p>
            <h2>{totalContracts}</h2>
        </div>

        <div className="stat-card active">
          <p>Active</p>
          <h2>{activeContracts}</h2>
        </div>

        <div className="stat-card starting">
          <p>Starting Within 6 Weeks</p>
          <h2>{startingWithinSixWeeks}</h2>
        </div>
    </div>

        <button
          type="button"
          onClick={() => setShowCreateForm(true)}
        >
          Add Contract
        </button>

        <button
          type="button"
          onClick={() => setShowMasterAgreementForm(true)}
        >
          Add Master Agreement
        </button>

        {showCreateForm && (
        <div className="modal-backdrop">
          <div className="modal contract-modal">
          <h2>Create Contract</h2>

        <div className="contract-form-grid">
          <label>
            KCH #
            <input
              type="text"
              value={newKchNumber}
              onChange={(event) =>
                setNewKchNumber(event.target.value)
          }
            />
          </label>

          <label>
          Institution / Company
          <input
            type="text"
            value={newInstitutionCompanyName}
            onChange={(event) =>
              setNewInstitutionCompanyName(event.target.value)
          }
          />
        </label>

        <label>
          Department
          <select
            value={newDepartment}
            onChange={(event) =>
              setNewDepartment(event.target.value)
            }
          >
            <option value="">Select Department</option>

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
          Contract Type
          <select
            value={newContractType}
            onChange={(event) =>
              setNewContractType(event.target.value)
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
            value={newRequestReceived}
            onChange={(event) =>
              setNewRequestReceived(event.target.value)
            }
          />
        </label>

        <label>
          Institution Contact
          <input
            type="text"
            value={newInstitutionContact}
            onChange={(event) =>
              setNewInstitutionContact(event.target.value)
          }
            />
        </label>

        <label>
          Hospital Contact
          <input
            type="text"
            value={newHospitalContact}
            onChange={(event) =>
              setNewHospitalContact(event.target.value)
          }
            />
        </label>

        <label>
          Contract Start Date
          <input
            type="date"
            value={newContractStartDate}
            onChange={(event) =>
              setNewContractStartDate(event.target.value)
          }
            />
        </label>

        <label>
          Contract End Date
          <input
            type="date"
            value={newContractEndDate}
            onChange={(event) =>
              setNewContractEndDate(event.target.value)
         }
            />
        </label>

      <label>
        Contract Status
        <select
          value={newContractStatus}
          onChange={(event) =>
            setNewContractStatus(event.target.value)
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
        value={newAssignedAttorney}
        onChange={(event) =>
          setNewAssignedAttorney(event.target.value)
        }
      />
    </label>

    <label>
      Contract Manager
      <input
        type="text"
        value={newContractManager}
        onChange={(event) =>
         setNewContractManager(event.target.value)
        }
      />
    </label>

    <label>
      Document Link
      <input
        type="text"
        value={newDocumentLink}
        onChange={(event) =>
          setNewDocumentLink(event.target.value)
        }
      />
    </label>

    <label>
      Master Agreement
      <select
        value={newMasterAgreementId}
        onChange={(event) =>
          setNewMasterAgreementId(event.target.value)
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
    </label>

    <label>
      Notes
      <textarea
        value={newNotes}
        onChange={(event) =>
          setNewNotes(event.target.value)
        }
        rows={4}
      />
    </label>
    </div>
  

    <div className="modal-actions">

        <button
          type="button"
          onClick={async () => {
            try {
              await createContract({
                kch_number: newKchNumber,
                institution_company_name: newInstitutionCompanyName,
                department: newDepartment,
                contract_type: newContractType,
                request_received: newRequestReceived || null,
                institution_contact: newInstitutionContact,
                hospital_contact: newHospitalContact,
                contract_start_date: newContractStartDate || null,
                contract_end_date: newContractEndDate || null,
                contract_status: newContractStatus,
                assigned_attorney: newAssignedAttorney,
                contract_manager: newContractManager,
                master_agreement_id: newMasterAgreementId ? Number(newMasterAgreementId): null,
                document_link: newDocumentLink,
                notes: newNotes,
              });

              toast.success("Contract created successfully.");

              setNewKchNumber("");
              setNewInstitutionCompanyName("");
              setNewDepartment("");
              setNewContractType("Other");
              setShowCreateForm(false);
              setNewRequestReceived("");
              setNewInstitutionContact("");
              setNewHospitalContact("");
              setNewContractStartDate("");
              setNewContractEndDate("");
              setNewContractStatus("Request Received");
              setNewAssignedAttorney("");
              setNewContractManager("");
              setNewMasterAgreementId("");
              setNewDocumentLink("");
              setNewNotes("");

              const refreshedContracts =
                await getContracts({
                  search: searchTerm,
                  department: departmentFilter,
                  status: statusFilter,
                });

              setContracts(
                refreshedContracts.contracts
              );
            } catch (err) {
              console.error(err);

              if (err instanceof Error) {
                toast.error(err.message);
              } else {
                toast.error("Something went wrong.");
              }
            }
          }}
        >
          Create Contract
        </button>

        <button
          type="button"
          onClick={() => setShowCreateForm(false)}
        >
         Cancel
        </button>
      </div>
    </div>
  </div>  
    )}

 {showMasterAgreementForm && (
      <div className="modal-backdrop">
      <div className="modal contract-modal">
        <h2>Create Master Agreement</h2>

      <div className="contract-form-grid">
        <label>
          Agreement #
          <input
            type="text"
            value={newAgreementNumber}
            onChange={(event) =>
              setNewAgreementNumber(event.target.value)
            }
          />
        </label>

        <label>
          School / Institution
          <input
            type="text"
            value={newMasterInstitution}
            onChange={(event) =>
              setNewMasterInstitution(event.target.value)
            }
          />
        </label>

        <label>
          Agreement Date
          <input
            type="date"
            value={newAgreementDate}
            onChange={(event) =>
              setNewAgreementDate(event.target.value)
            }
          />
        </label>

        <label>
          End Date
          <input
            type="date"
            value={newMasterEndDate}
            onChange={(event) =>
              setNewMasterEndDate(event.target.value)
            }
            />
        </label>

        <label>
          Document Link
          <input
            type="text"
            value={newMasterDocumentLink}
            onChange={(event) =>
              setNewMasterDocumentLink(event.target.value)
            }
          />
        </label>

        <label>
          Notes
          <textarea
            value={newMasterNotes}
            onChange={(event) =>
              setNewMasterNotes(event.target.value)
            }
            rows={4}
          />
        </label>
      </div>

      <div className="modal-actions">
        <button
          type="button"
          onClick={async() => {
          try {
            await createMasterAgreement({
              agreement_number: newAgreementNumber,
              institution_company_name: newMasterInstitution,
              date: newAgreementDate || null,
              end_date: newMasterEndDate || null,
              document_link: newMasterDocumentLink,
              notes: newMasterNotes,
            });

            toast.success("Master agreement created successfully.");

            const refreshedMasterAgreements =
              await getMasterAgreements();

            setMasterAgreements(
              refreshedMasterAgreements.master_agreements
            );

            setNewAgreementNumber("");
            setNewMasterInstitution("");
            setNewAgreementDate("");
            setNewMasterEndDate("");
            setNewMasterDocumentLink("");
            setNewMasterNotes("");

            setShowMasterAgreementForm(false);
            } catch (err) {
            console.error(err);

            if (err instanceof Error) {
            toast.error(err.message);
              } else {
            toast.error("Something went wrong.");
            }
          }
        }}
        >
          Create Master Agreement
        </button>

        <button
          type="button"
          onClick={() => setShowMasterAgreementForm(false)}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}

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

          <label>
            Record Type
            <select
              value={recordTypeFilter}
              onChange={(event) =>
                setRecordTypeFilter(event.target.value)
            }
            >
              <option value="">All Records</option>
              <option value="Contract">Contracts</option>
              <option value="Master Agreement">
                Master Agreements
              </option>
          </select>
        </label>

          <button
            type="button"
            className="clear-filters-button"
            onClick={() => {
              setSearchTerm("");
              setDepartmentFilter("");
              setStatusFilter("");
              setRecordTypeFilter("");
            }}
              >
            Clear Filters
          </button>
        </div>

        <div className="contract-table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Record Type</th>
                <th>KCH #</th>
                <th>Institution / Company</th>
                <th>Department</th>
                <th>Contract Type</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {combinedRecords.map((record) => (
               <tr
                  key={`${record.recordType}-${record.id}`}
                  className="clickable-row"
                  onClick={async () => {
                    if (record.recordType === "Master Agreement") {
                      try {
                        const agreementData =
                        await getMasterAgreement(record.id);

                        setSelectedMasterAgreement(
                          agreementData.master_agreement
                        );

                        setEditAgreementNumber(
                          agreementData.master_agreement.agreement_number
                        );

                        setEditMasterInstitution(
                          agreementData.master_agreement.institution_company_name
                        );

                        setEditAgreementDate(
                          agreementData.master_agreement.date ?? ""
                        );

                        setEditMasterEndDate(
                          agreementData.master_agreement.end_date ?? ""
                        );

                        setEditMasterDocumentLink(
                          agreementData.master_agreement.document_link ?? ""
                        );

                        setEditMasterNotes(
                          agreementData.master_agreement.notes ?? ""
                        );

                        setEditMasterMode(false);


                        } catch (err) {
                          console.error(err);

                        if (err instanceof Error) {
                          toast.error(err.message);
                        } else {
                          toast.error(
                            "Could not load master agreement."
                          );
                        }
                      }
                          return;
                }

              const contract = record.original as Contract;

              try {
                const contractData =
                await getContract(contract.id);

                const historyData =
                await getContractHistory(contract.id);

                setSelectedContract(
                  contractData.contract
                );

                setEditKchNumber(
                  contractData.contract.kch_number
                );

                setEditMasterAgreementId(
                  contractData.contract.master_agreement_id
                  ? String(contractData.contract.master_agreement_id)
                  : ""
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
          >
            <td>{record.recordType}</td>

            <td>{record.number}</td>

            <td>{record.institution}</td>

            <td>{record.department}</td>

            <td>{record.contractType}</td>

            <td>
              {record.recordType === "Contract" ? (
                <span
                 className={`status-badge status-${record.status
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")}`}
                >
                  {record.status}
                </span>
             ) : (
                "—"
              )}
            </td>

            </tr>
          ))}
        </tbody>
          </table>
        </div>
      </section>

      {selectedContract && (
       <div className="modal-backdrop">
        <div className="modal contract-modal">
          <h2>Contract Details</h2>

          <p>
            <strong>KCH #:</strong>{" "}

            {editMode ? (
              <input
                type="text"
                value={editKchNumber}
                onChange={(event) =>
                  setEditKchNumber(event.target.value)
            }
              />
          ) : (
            selectedContract.kch_number
          )}
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
             {editMode ? (
              <select
                value={editMasterAgreementId}
                onChange={(event) =>
                  setEditMasterAgreementId(event.target.value)
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
              ) : (
                selectedContract.master_agreement_id
                  ? masterAgreements.find(
                    (agreement) =>
                      agreement.id ===
                      selectedContract.master_agreement_id
                  )?.agreement_number ?? "—"
              : "—"
            )}
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
                  kch_number: editKchNumber,
                  contract_status: editContractStatus,
                  department: editDepartment,
                  contract_type: editContractType,
                  assigned_attorney: editAssignedAttorney,
                  contract_manager: editContractManager,
                  institution_company_name: editInstitutionCompanyName,
                  institution_contact: editInstitutionContact,
                  hospital_contact: editHospitalContact,
                  master_agreement_id: editMasterAgreementId ? Number(editMasterAgreementId): null,
                  document_link: editDocumentLink,
                  notes: editNotes,
                  request_received: editRequestReceived || null,
                  contract_start_date: editContractStartDate || null,
                  contract_end_date: editContractEndDate || null,
                }
              );

              toast.success("Contract updated successfully.");

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
                toast.error(err.message);
              } else {
                toast.error("Something went wrong.");
              }
            }
          }}
        >
          Save Changes
    </button>

    <button
      type="button"
      onClick={() => {
        setEditKchNumber(selectedContract.kch_number);
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
        setEditMasterAgreementId(selectedContract.master_agreement_id ? String(selectedContract.master_agreement_id): "");

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
        </div>
    </div>
    )}

    {selectedMasterAgreement && (
  <div className="modal-backdrop">
    <div className="modal contract-modal">
      <h2>Master Agreement Details</h2>

      <p>
        <strong>Agreement #:</strong>{" "}
        {editMasterMode ? (
          <input
            type="text"
            value={editAgreementNumber}
            onChange={(event) =>
              setEditAgreementNumber(event.target.value)
            }
          />
        ) : (
          selectedMasterAgreement.agreement_number
        )}
      </p>

      <p>
        <strong>School / Institution:</strong>{" "}
        {editMasterMode ? (
          <input
            type="text"
            value={editMasterInstitution}
            onChange={(event) =>
              setEditMasterInstitution(event.target.value)
            }
          />
        ) : (
          selectedMasterAgreement.institution_company_name
        )}
      </p>

      <p>
        <strong>Agreement Date:</strong>{" "}
        {editMasterMode ? (
          <input
            type="date"
            value={editAgreementDate}
            onChange={(event) =>
              setEditAgreementDate(event.target.value)
            }
          />
        ) : (
          selectedMasterAgreement.date || "—"
        )}
      </p>

        <p>
          <strong>End Date:</strong>{" "}

          {editMasterMode ? (
            <input
              type="date"
              value={editMasterEndDate}
              onChange={(event) =>
                setEditMasterEndDate(event.target.value)
              }
              />
          ) : (
            selectedMasterAgreement.end_date || "—"
            )}
      </p>

      <p>
        <strong>Document Link:</strong>{" "}
        {editMasterMode ? (
          <input
            type="text"
            value={editMasterDocumentLink}
            onChange={(event) =>
              setEditMasterDocumentLink(event.target.value)
            }
          />
        ) : selectedMasterAgreement.document_link ? (
          <a
            href={selectedMasterAgreement.document_link}
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

      {editMasterMode ? (
        <textarea
          value={editMasterNotes}
          onChange={(event) =>
            setEditMasterNotes(event.target.value)
          }
          rows={4}
        />
      ) : (
        <p>{selectedMasterAgreement.notes || "—"}</p>
      )}

      <p>
        <strong>Created At:</strong>{" "}
        {formatDateTime(
          selectedMasterAgreement.created_at
        )}
      </p>

      <p>
        <strong>Updated At:</strong>{" "}
        {formatDateTime(
          selectedMasterAgreement.updated_at
        )}
      </p>

      {!editMasterMode ? (
        <button
          type="button"
          onClick={() => setEditMasterMode(true)}
        >
          Edit Master Agreement
        </button>
      ) : (
        <>
          <button
            type="button"
            onClick={async () => {
              try {
                const result =
                  await updateMasterAgreement(
                    selectedMasterAgreement.id,
                    {
                      agreement_number:
                        editAgreementNumber,
                      institution_company_name:
                        editMasterInstitution,
                      date:
                        editAgreementDate || null,
                      document_link:
                        editMasterDocumentLink,
                      notes:
                        editMasterNotes,
                    }
                  );

                toast.success(
                  "Master agreement updated successfully."
                );

                setSelectedMasterAgreement(
                  result.master_agreement
                );

                const refreshedMasterAgreements =
                  await getMasterAgreements();

                setMasterAgreements(
                  refreshedMasterAgreements.master_agreements
                );

                setEditMasterMode(false);
              } catch (err) {
                console.error(err);

                if (err instanceof Error) {
                  toast.error(err.message);
                } else {
                  toast.error(
                    "Something went wrong."
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
              setEditAgreementNumber(
                selectedMasterAgreement.agreement_number
              );

              setEditMasterInstitution(
                selectedMasterAgreement.institution_company_name
              );

              setEditAgreementDate(
                selectedMasterAgreement.date ?? ""
              );

              setEditMasterEndDate(
                selectedMasterAgreement.end_date ?? ""
              );

              setEditMasterDocumentLink(
                selectedMasterAgreement.document_link ?? ""
              );

              setEditMasterNotes(
                selectedMasterAgreement.notes ?? ""
              );

              setEditMasterMode(false);
            }}
          >
            Cancel
          </button>
        </>
      )}

      <button
        type="button"
        onClick={() => {
          setSelectedMasterAgreement(null);
          setEditMasterMode(false);
        }}
      >
        Close
      </button>
    </div>
  </div>
)}

    </main>
  );
}

export default App;