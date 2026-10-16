import type { Contract } from "../types";

type ContractBoardProps = {
  contracts: Contract[];
  onContractClick: (contract: Contract) => void;
  onStatusChange: (
    contract: Contract,
    newStatus: string
  ) => void;
};

const BOARD_STATUSES = [
  "Request Received",
  "Drafting",
  "Drafted / In Review",
  "Signatures in Progress",
  "Fully Executed",
  "Active",
  "On Hold",
  "Expired",
  "Canceled",
];

function ContractBoard({
  contracts,
  onContractClick,
  onStatusChange,
}: ContractBoardProps) {
  return (
    <div className="contract-board">
      {BOARD_STATUSES.map((status) => {
        const contractsForStatus = contracts.filter(
          (contract) => contract.contract_status === status
        );

        return (
          <section
            key={status}
            className="board-column"
          >
            <div className="board-column-header">
              <h3>{status}</h3>

              <span className="board-count">
                {contractsForStatus.length}
              </span>
            </div>

            <div
                className="board-column-body"
                onDragOver={(event) => {
                    event.preventDefault();
                }}
                onDrop={(event) => {
                    event.preventDefault();

                    const contractId = Number(
                    event.dataTransfer.getData("contractId")
                    );

                    const contract = contracts.find(
                    (item) => item.id === contractId
                    );

                    if (!contract) {
                    return;
                    }

                    if (contract.contract_status === status) {
                    return;
                    }

                    onStatusChange(contract, status);
                }}
                >
              {contractsForStatus.length === 0 ? (
                <div className="board-empty">
                  No contracts
                </div>
              ) : (
                contractsForStatus.map((contract) => (
                  <button
                    key={contract.id}
                    type="button"
                    className="board-card"
                    draggable
                    onDragStart={(event) => {
                        event.dataTransfer.setData(
                        "contractId",
                        String(contract.id)
                        );
                    }}
                    onClick={() =>
                        onContractClick(contract)
                    }
                    >
                    <strong>
                      {contract.kch_number}
                    </strong>

                    <span className="board-card-title">
                      {
                        contract.institution_company_name
                      }
                    </span>

                    <span className="board-card-meta">
                      {contract.department || "No department"}
                    </span>

                    {contract.contract_start_date && (
                      <span className="board-card-date">
                        Starts{" "}
                        {contract.contract_start_date}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}

export default ContractBoard;