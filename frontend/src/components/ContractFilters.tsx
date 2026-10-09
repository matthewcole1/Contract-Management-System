type ContractFiltersProps = {
  searchTerm: string;
  departmentFilter: string;
  statusFilter: string;
  recordTypeFilter: string;

  departments: {
    id: number;
    name: string;
  }[];

  contractStatuses: string[];

  onSearchChange: (value: string) => void;
  onDepartmentChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onRecordTypeChange: (value: string) => void;
  onClear: () => void;
};

function ContractFilters({
  searchTerm,
  departmentFilter,
  statusFilter,
  recordTypeFilter,
  departments,
  contractStatuses,
  onSearchChange,
  onDepartmentChange,
  onStatusChange,
  onRecordTypeChange,
  onClear,
}: ContractFiltersProps) {
  return (
    <div className="filters">
      <label>
        Search
        <input
          type="text"
          value={searchTerm}
          onChange={(event) =>
            onSearchChange(event.target.value)
          }
          placeholder="KCH #, company, contact..."
        />
      </label>

      <label>
        Department
        <select
          value={departmentFilter}
          onChange={(event) =>
            onDepartmentChange(event.target.value)
          }
        >
          <option value="">All Departments</option>

          {departments.map((department) => (
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
            onStatusChange(event.target.value)
          }
        >
          <option value="">All Statuses</option>

          {contractStatuses.map((status) => (
            <option key={status} value={status}>
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
            onRecordTypeChange(event.target.value)
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
        onClick={onClear}
      >
        Clear Filters
      </button>
    </div>
  );
}

export default ContractFilters;