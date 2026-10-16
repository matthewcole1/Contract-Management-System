import type {
  Contract,
  MasterAgreement,
} from "../types";

type ReportsPanelProps = {
  contracts: Contract[];
  masterAgreements: MasterAgreement[];
};

function ReportsPanel({
  contracts,
  masterAgreements,
}: ReportsPanelProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const thirtyDaysFromNow = new Date(today);
  thirtyDaysFromNow.setDate(
    thirtyDaysFromNow.getDate() + 30
  );

  const sixtyDaysFromNow = new Date(today);
  sixtyDaysFromNow.setDate(
    sixtyDaysFromNow.getDate() + 60
  );

  const ninetyDaysFromNow = new Date(today);
  ninetyDaysFromNow.setDate(
    ninetyDaysFromNow.getDate() + 90
  );

  const startingWithin30Days =
    contracts.filter((contract) => {
      if (!contract.contract_start_date) {
        return false;
      }

      const startDate = new Date(
        `${contract.contract_start_date}T00:00:00`
      );

      return (
        startDate >= today &&
        startDate <= thirtyDaysFromNow
      );
    }).length;

  const startingWithin60Days =
    contracts.filter((contract) => {
      if (!contract.contract_start_date) {
        return false;
      }

      const startDate = new Date(
        `${contract.contract_start_date}T00:00:00`
      );

      return (
        startDate >= today &&
        startDate <= sixtyDaysFromNow
      );
    }).length;

  const startingWithin90Days =
    contracts.filter((contract) => {
      if (!contract.contract_start_date) {
        return false;
      }

      const startDate = new Date(
        `${contract.contract_start_date}T00:00:00`
      );

      return (
        startDate >= today &&
        startDate <= ninetyDaysFromNow
      );
    }).length;

  const expiringWithin90Days =
    contracts.filter((contract) => {
      if (!contract.contract_end_date) {
        return false;
      }

      const endDate = new Date(
        `${contract.contract_end_date}T00:00:00`
      );

      return (
        endDate >= today &&
        endDate <= ninetyDaysFromNow
      );
    }).length;

  const statusCounts = contracts.reduce<
    Record<string, number>
  >((counts, contract) => {
    const status =
      contract.contract_status || "Unknown";

    counts[status] =
      (counts[status] ?? 0) + 1;

    return counts;
  }, {});

  const departmentCounts = contracts.reduce<
    Record<string, number>
  >((counts, contract) => {
    const department =
      contract.department || "No Department";

    counts[department] =
      (counts[department] ?? 0) + 1;

    return counts;
  }, {});

  const sortedStatuses = Object.entries(
    statusCounts
  ).sort((a, b) => b[1] - a[1]);

  const sortedDepartments = Object.entries(
    departmentCounts
  ).sort((a, b) => b[1] - a[1]);

  return (
    <div className="reports-layout">
      <div className="reports-summary-grid">
        <div className="report-card">
          <span>Total Contracts</span>
          <strong>{contracts.length}</strong>
        </div>

        <div className="report-card">
          <span>Master Agreements</span>
          <strong>
            {masterAgreements.length}
          </strong>
        </div>

        <div className="report-card">
          <span>Starting in 30 Days</span>
          <strong>{startingWithin30Days}</strong>
        </div>

        <div className="report-card">
          <span>Starting in 60 Days</span>
          <strong>{startingWithin60Days}</strong>
        </div>

        <div className="report-card">
          <span>Starting in 90 Days</span>
          <strong>{startingWithin90Days}</strong>
        </div>

        <div className="report-card">
          <span>Expiring in 90 Days</span>
          <strong>{expiringWithin90Days}</strong>
        </div>
      </div>

      <div className="reports-two-column">
        <section className="report-panel">
          <div className="report-panel-header">
            <h3>Contracts by Status</h3>
          </div>

          <div className="report-list">
            {sortedStatuses.map(
              ([status, count]) => (
                <div
                  key={status}
                  className="report-list-row"
                >
                  <span>{status}</span>
                  <strong>{count}</strong>
                </div>
              )
            )}
          </div>
        </section>

        <section className="report-panel">
          <div className="report-panel-header">
            <h3>Contracts by Department</h3>
          </div>

          <div className="report-list">
            {sortedDepartments.map(
              ([department, count]) => (
                <div
                  key={department}
                  className="report-list-row"
                >
                  <span>{department}</span>
                  <strong>{count}</strong>
                </div>
              )
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default ReportsPanel;