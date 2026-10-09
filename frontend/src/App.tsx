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

import DashboardStats from "./components/DashboardStats";
import ContractFilters from "./components/ContractFilters";
import RecordsTable from "./components/RecordsTable";
import CreateMasterAgreementModal from "./components/CreateMasterAgreementModal";
import MasterAgreementDetailsModal from "./components/MasterAgreementDetailsModal";
import CreateContractModal from "./components/CreateContractModal";
import ContractDetailsModal from "./components/ContractDetailsModal";

import type {
  Contract,
  MasterAgreement,
  RecordRow,
  Options,
  AuditEntry,
} from "./types";

function App() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [masterAgreements, setMasterAgreements] = useState<MasterAgreement[]>([]);
  const [options, setOptions] = useState<Options | null>(null);
  const [error, setError] = useState("");

  const [departmentFilter, setDepartmentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [recordTypeFilter, setRecordTypeFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

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

  const [isCreatingContract, setIsCreatingContract] = useState(false);
  const [isCreatingMasterAgreement, setIsCreatingMasterAgreement] = useState(false);
  const [isSavingContract, setIsSavingContract] = useState(false);
  const [isSavingMasterAgreement, setIsSavingMasterAgreement] = useState(false);
  const [isLoadingRecords, setIsLoadingRecords] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm]);

  useEffect(() => {
    async function loadData() {
      setIsLoadingRecords(true);
      
      try {
        setError("");
        const contractsData = await getContracts({
          search: debouncedSearchTerm,
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
      } finally {
      setIsLoadingRecords(false)
    }
    }  

    loadData();
  }, [debouncedSearchTerm, departmentFilter, statusFilter]);

  const totalContracts = contracts.length;

const activeContracts = contracts.filter(
  (contract) => contract.contract_status === "Active"
).length;

const today = new Date();
today.setHours(0, 0, 0, 0);

const sixWeeksFromNow = new Date(today);
sixWeeksFromNow.setDate(today.getDate() + 42);

const visibleMasterAgreements = masterAgreements.filter((agreement) => {
  if (departmentFilter || statusFilter) {
    return false;
  }

  if (!searchTerm.trim()) {
    return true;
  }

  const search = searchTerm.trim().toLowerCase();

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

  const startDate = new Date(`${contract.contract_start_date}T00:00:00`);

  return startDate >= today && startDate <= sixWeeksFromNow;
}).length;

async function handleRecordClick(
  record: RecordRow
) {
  if (record.recordType === "Master Agreement") {
    await handleOpenMasterAgreement(record);
    return;
  }

  await handleOpenContract(record);
}

  async function handleCreateMasterAgreement() {
  setIsCreatingMasterAgreement(true);

  try {
    await createMasterAgreement({
      agreement_number: newAgreementNumber,
      institution_company_name: newMasterInstitution,
      date: newAgreementDate || null,
      end_date: newMasterEndDate || null,
      document_link: newMasterDocumentLink,
      notes: newMasterNotes,
    });

    toast.success(
      "Master agreement created successfully."
    );

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
  } finally {
    setIsCreatingMasterAgreement(false);
  }
}

async function handleCreateContract() {
  setIsCreatingContract(true);

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
      master_agreement_id: newMasterAgreementId
        ? Number(newMasterAgreementId)
        : null,
      document_link: newDocumentLink,
      notes: newNotes,
    });

    toast.success("Contract created successfully.");

    setNewKchNumber("");
    setNewInstitutionCompanyName("");
    setNewDepartment("");
    setNewContractType("Other");
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

    setShowCreateForm(false);

    const refreshedContracts = await getContracts({
      search: searchTerm,
      department: departmentFilter,
      status: statusFilter,
    });

    setContracts(refreshedContracts.contracts);
  } catch (err) {
    console.error(err);

    if (err instanceof Error) {
      toast.error(err.message);
    } else {
      toast.error("Something went wrong.");
    }
  } finally {
    setIsCreatingContract(false);
  }
}

async function handleSaveMasterAgreement() {
  if (!selectedMasterAgreement) {
    return;
  }

  setIsSavingMasterAgreement(true);

  try {
    const result = await updateMasterAgreement(
      selectedMasterAgreement.id,
      {
        agreement_number: editAgreementNumber,
        institution_company_name: editMasterInstitution,
        date: editAgreementDate || null,
        end_date: editMasterEndDate || null,
        document_link: editMasterDocumentLink,
        notes: editMasterNotes,
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
      toast.error("Something went wrong.");
    }
  } finally {
    setIsSavingMasterAgreement(false);
  }
}

async function handleSaveContract() {
  if (!selectedContract) {
    return;
  }

  setIsSavingContract(true);

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

    toast.success(
      "Contract updated successfully."
    );

    setSelectedContract(result.contract);

    const refreshedContracts = await getContracts({
      search: searchTerm,
      department: departmentFilter,
      status: statusFilter,
    });

    setContracts(refreshedContracts.contracts);

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
  } finally {
    setIsSavingContract(false);
  }
}

function handleCancelContractEdit() {
  if (!selectedContract) {
    return;
  }

  setEditKchNumber(
    selectedContract.kch_number
  );

  setEditContractStatus(
    selectedContract.contract_status
  );

  setEditAssignedAttorney(
    selectedContract.assigned_attorney ?? ""
  );

  setEditContractManager(
    selectedContract.contract_manager ?? ""
  );

  setEditDocumentLink(
    selectedContract.document_link ?? ""
  );

  setEditNotes(
    selectedContract.notes ?? ""
  );

  setEditRequestReceived(
    selectedContract.request_received ?? ""
  );

  setEditContractStartDate(
    selectedContract.contract_start_date ?? ""
  );

  setEditContractEndDate(
    selectedContract.contract_end_date ?? ""
  );

  setEditDepartment(
    selectedContract.department
  );

  setEditContractType(
    selectedContract.contract_type
  );

  setEditInstitutionCompanyName(
    selectedContract.institution_company_name
  );

  setEditInstitutionContact(
    selectedContract.institution_contact ?? ""
  );

  setEditHospitalContact(
    selectedContract.hospital_contact ?? ""
  );

  setEditMasterAgreementId(
    selectedContract.master_agreement_id
      ? String(selectedContract.master_agreement_id)
      : ""
  );

  setEditMode(false);
}

function handleCancelMasterAgreementEdit() {
  if (!selectedMasterAgreement) {
    return;
  }

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
}

function handleCloseContractDetails() {
  setSelectedContract(null);
  setHistory([]);
  setEditMode(false);
}

function handleCloseMasterAgreementDetails() {
  setSelectedMasterAgreement(null);
  setEditMasterMode(false);
}

function handleClearFilters() {
  setSearchTerm("");
  setDepartmentFilter("");
  setStatusFilter("");
  setRecordTypeFilter("");
}

function handleOpenCreateContract() {
  setShowCreateForm(true);
}

function handleOpenCreateMasterAgreement() {
  setShowMasterAgreementForm(true);
}

function handleCloseCreateContract() {
  setShowCreateForm(false);
}

function handleCloseCreateMasterAgreement() {
  setShowMasterAgreementForm(false);
}

async function handleOpenMasterAgreement(record: RecordRow) {
  try {
    const agreementData =
      await getMasterAgreement(record.id);

    setSelectedMasterAgreement(
      agreementData.master_agreement
    );

    populateMasterAgreementEditState(
      agreementData.master_agreement
    );

    setEditMasterMode(false);
  } catch (err) {
    console.error(err);

    if (err instanceof Error) {
      toast.error(err.message);
    } else {
      toast.error("Could not load master agreement.");
    }
  }
}

async function handleOpenContract(record: RecordRow) {
  const contract = record.original as Contract;

  try {
    const contractData =
      await getContract(contract.id);

    const historyData =
      await getContractHistory(contract.id);

    setSelectedContract(
      contractData.contract
    );

    populateContractEditState(
      contractData.contract
    );

    setHistory(
      historyData.history ?? []
    );

    } catch (err) {
      console.error(err);

    toast.error(
      "Could not load contract details."
    );
  }
}

function populateContractEditState(contract: Contract) {
  setEditKchNumber(contract.kch_number);
  setEditContractStatus(contract.contract_status);
  setEditAssignedAttorney(contract.assigned_attorney ?? "");
  setEditContractManager(contract.contract_manager ?? "");
  setEditNotes(contract.notes ?? "");
  setEditDocumentLink(contract.document_link ?? "");
  setEditRequestReceived(contract.request_received ?? "");
  setEditContractStartDate(contract.contract_start_date ?? "");
  setEditContractEndDate(contract.contract_end_date ?? "");
  setEditDepartment(contract.department);
  setEditContractType(contract.contract_type);
  setEditInstitutionCompanyName(
    contract.institution_company_name
  );
  setEditInstitutionContact(
    contract.institution_contact ?? ""
  );
  setEditHospitalContact(
    contract.hospital_contact ?? ""
  );
  setEditMasterAgreementId(
    contract.master_agreement_id
      ? String(contract.master_agreement_id)
      : ""
  );
}

function populateMasterAgreementEditState(
  agreement: MasterAgreement
) {
  setEditAgreementNumber(
    agreement.agreement_number
  );

  setEditMasterInstitution(
    agreement.institution_company_name
  );

  setEditAgreementDate(
    agreement.date ?? ""
  );

  setEditMasterEndDate(
    agreement.end_date ?? ""
  );

  setEditMasterDocumentLink(
    agreement.document_link ?? ""
  );

  setEditMasterNotes(
    agreement.notes ?? ""
  );
}

  return (
    <main>
      <Toaster position="top-right" />

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="page-header">
  <div>
    <h1>Kings County Hospital Contract Management</h1>
    <p className="page-subtitle">
      Manage contracts, master agreements, and upcoming start dates.
    </p>
  </div>

  <div className="header-actions">
    <button
      type="button"
      className="button button-primary"
      onClick={handleOpenCreateContract}
    >
      Add Contract
    </button>

    <button
      type="button"
      className="button button-secondary"
      onClick={handleOpenCreateMasterAgreement}
    >
      Add Master Agreement
    </button>
  </div>
</div>

    <section> 
      <h2>Contracts</h2>

      <DashboardStats
        totalContracts={totalContracts}
        activeContracts={activeContracts}
        startingWithinSixWeeks={startingWithinSixWeeks}
      />

        <CreateContractModal
          isOpen={showCreateForm}
          isCreating={isCreatingContract}
          kchNumber={newKchNumber}
          institutionCompanyName={newInstitutionCompanyName}
          department={newDepartment}
          contractType={newContractType}
          requestReceived={newRequestReceived}
          institutionContact={newInstitutionContact}
          hospitalContact={newHospitalContact}
          contractStartDate={newContractStartDate}
          contractEndDate={newContractEndDate}
          contractStatus={newContractStatus}
          assignedAttorney={newAssignedAttorney}
          contractManager={newContractManager}
          masterAgreementId={newMasterAgreementId}
          documentLink={newDocumentLink}
          notes={newNotes}
          options={options}
          masterAgreements={masterAgreements}
          onKchNumberChange={setNewKchNumber}
          onInstitutionCompanyNameChange={setNewInstitutionCompanyName}
          onDepartmentChange={setNewDepartment}
          onContractTypeChange={setNewContractType}
          onRequestReceivedChange={setNewRequestReceived}
          onInstitutionContactChange={setNewInstitutionContact}
          onHospitalContactChange={setNewHospitalContact}
          onContractStartDateChange={setNewContractStartDate}
          onContractEndDateChange={setNewContractEndDate}
          onContractStatusChange={setNewContractStatus}
          onAssignedAttorneyChange={setNewAssignedAttorney}
          onContractManagerChange={setNewContractManager}
          onMasterAgreementIdChange={setNewMasterAgreementId}
          onDocumentLinkChange={setNewDocumentLink}
          onNotesChange={setNewNotes}
          onCreate={handleCreateContract}
          onClose={handleCloseCreateContract}
          />

    <CreateMasterAgreementModal
        isOpen={showMasterAgreementForm}
        isCreating={isCreatingMasterAgreement}
        agreementNumber={newAgreementNumber}
        institution={newMasterInstitution}
        agreementDate={newAgreementDate}
        endDate={newMasterEndDate}
        documentLink={newMasterDocumentLink}
        notes={newMasterNotes}
        onAgreementNumberChange={setNewAgreementNumber}
        onInstitutionChange={setNewMasterInstitution}
        onAgreementDateChange={setNewAgreementDate}
        onEndDateChange={setNewMasterEndDate}
        onDocumentLinkChange={setNewMasterDocumentLink}
        onNotesChange={setNewMasterNotes}
        onCreate={handleCreateMasterAgreement}
        onClose={handleCloseCreateMasterAgreement}
        />

    <ContractFilters
        searchTerm={searchTerm}
        departmentFilter={departmentFilter}
        statusFilter={statusFilter}
        recordTypeFilter={recordTypeFilter}
        departments={options?.departments ?? []}
        contractStatuses={options?.contract_statuses ?? []}
        onSearchChange={setSearchTerm}
        onDepartmentChange={setDepartmentFilter}
        onStatusChange={setStatusFilter}
        onRecordTypeChange={setRecordTypeFilter}
        onClear={handleClearFilters}
          />

        {isLoadingRecords ? (
          <div className="loading-state">
              Loading records...
          </div>
      ) : (
        <RecordsTable
          records={combinedRecords}
            onRecordClick={handleRecordClick}
        />
      )} 
      </section>

      <ContractDetailsModal
        contract={selectedContract}
        editMode={editMode}
        isSaving={isSavingContract}
        history={history}
        options={options}
        masterAgreements={masterAgreements}
        kchNumber={editKchNumber}
        institutionCompanyName={editInstitutionCompanyName}
        institutionContact={editInstitutionContact}
        hospitalContact={editHospitalContact}
        department={editDepartment}
        contractType={editContractType}
        requestReceived={editRequestReceived}
        contractStartDate={editContractStartDate}
        contractEndDate={editContractEndDate}
        contractStatus={editContractStatus}
        assignedAttorney={editAssignedAttorney}
        contractManager={editContractManager}
        masterAgreementId={editMasterAgreementId}
        documentLink={editDocumentLink}
        notes={editNotes}
        onKchNumberChange={setEditKchNumber}
        onInstitutionCompanyNameChange={setEditInstitutionCompanyName}
        onInstitutionContactChange={setEditInstitutionContact}
        onHospitalContactChange={setEditHospitalContact}
        onDepartmentChange={setEditDepartment}
        onContractTypeChange={setEditContractType}
        onRequestReceivedChange={setEditRequestReceived}
        onContractStartDateChange={setEditContractStartDate}
        onContractEndDateChange={setEditContractEndDate}
        onContractStatusChange={setEditContractStatus}
        onAssignedAttorneyChange={setEditAssignedAttorney}
        onContractManagerChange={setEditContractManager}
        onMasterAgreementIdChange={setEditMasterAgreementId}
        onDocumentLinkChange={setEditDocumentLink}
        onNotesChange={setEditNotes}
        onEdit={() => setEditMode(true)}
        onSave={handleSaveContract}
        onCancel={handleCancelContractEdit}
        onClose={handleCloseContractDetails}
      />

    <MasterAgreementDetailsModal
      agreement={selectedMasterAgreement}
      editMode={editMasterMode}
      isSaving={isSavingMasterAgreement}
      agreementNumber={editAgreementNumber}
      institution={editMasterInstitution}
      agreementDate={editAgreementDate}
      endDate={editMasterEndDate}
      documentLink={editMasterDocumentLink}
      notes={editMasterNotes}
      onAgreementNumberChange={setEditAgreementNumber}
      onInstitutionChange={setEditMasterInstitution}
      onAgreementDateChange={setEditAgreementDate}
      onEndDateChange={setEditMasterEndDate}
      onDocumentLinkChange={setEditMasterDocumentLink}
      onNotesChange={setEditMasterNotes}
      onEdit={() => setEditMasterMode(true)}
      onSave={handleSaveMasterAgreement}
      onCancel={handleCancelMasterAgreementEdit}
      onClose={handleCloseMasterAgreementDetails}
    />

    </main>
  );
}

export default App;