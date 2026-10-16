import type { Contract } from "../types";

type UpcomingContractsProps = {
  contracts: Contract[];
  onContractClick: (contract: Contract) => void;
};

function UpcomingContracts({
  contracts,
  onContractClick,
}: UpcomingContractsProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingContracts = contracts
    .filter((contract) => {
      if (!contract.contract_start_date) {
        return false;
      }

      const startDate = new Date(
        `${contract.contract_start_date}T00:00:00`
      );

      return startDate >= today;
    })
    .sort((a, b) =>
      (a.contract_start_date ?? "").localeCompare(
        b.contract_start_date ?? ""
      )
    )
    .slice(0, 8);

  return (
    <div className="overview-panel">
      <div className="overview-panel-header">
        <div>
          <h3>Upcoming Contracts</h3>
          <p>Next scheduled contract start dates</p>
        </div>

        <span className="overview-panel-count">
          {upcomingContracts.length}
        </span>
      </div>

      {upcomingContracts.length === 0 ? (
        <div className="overview-empty">
          No upcoming contract start dates.
        </div>
      ) : (
        <div className="upcoming-contract-list">
          {upcomingContracts.map((contract) => (
            <button
              key={contract.id}
              type="button"
              className="upcoming-contract-row"
              onClick={() => onContractClick(contract)}
            >
              <div className="upcoming-contract-main">
                <strong>{contract.kch_number}</strong>

                <span>
                  {contract.institution_company_name}
                </span>
              </div>

              <div className="upcoming-contract-info">
                <span>
                  {contract.department || "No department"}
                </span>

                <strong>
                  {contract.contract_start_date}
                </strong>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default UpcomingContracts;