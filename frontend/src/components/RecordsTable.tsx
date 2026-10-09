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
      original: {
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
      original: {
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
    };

type RecordsTableProps = {
  records: RecordRow[];
  onRecordClick: (record: RecordRow) => void;
};

function RecordsTable({
  records,
  onRecordClick,
}: RecordsTableProps) {
   if (records.length === 0) {
    return (
      <div className="empty-state">
        <h3>No records found</h3>
        <p>
          Try changing your search or filters.
        </p>
      </div>
    );
  }

  return (
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
          {records.map((record) => (
            <tr
              key={`${record.recordType}-${record.id}`}
              className="clickable-row"
              onClick={() => onRecordClick(record)}
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
  );
}

export default RecordsTable;