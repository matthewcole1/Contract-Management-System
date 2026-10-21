import { useState } from "react";
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
  const [draggedContractId, setDraggedContractId] =
    useState<number | null>(null);

  const [dragOverStatus, setDragOverStatus] =
    useState<string | null>(null);

  function handleDrop(status: string) {
    if (draggedContractId === null) {
      return;
    }

    const contract = contracts.find(
      (item) => item.id === draggedContractId
    );

    if (!contract) {
      return;
    }

    if (contract.contract_status === status) {
      setDragOverStatus(null);
      setDraggedContractId(null);
      return;
    }

    onStatusChange(contract, status);

    setDragOverStatus(null);
    setDraggedContractId(null);
  }

  return (
    <div className="contract-board">
      {BOARD_STATUSES.map((status) => {
        const contractsForStatus = contracts.filter(
          (contract) =>
            contract.contract_status === status
        );

        const isDragTarget =
          dragOverStatus === status;

        return (
          <section
            key={status}
            className={`board-column ${
              isDragTarget
                ? "board-column-drag-over"
                : ""
            }`}
            onDragOver={(event) => {
              event.preventDefault();

              event.dataTransfer.dropEffect =
                "move";

              setDragOverStatus(status);
            }}
            onDragEnter={(event) => {
              event.preventDefault();

              setDragOverStatus(status);
            }}
            onDrop={(event) => {
              event.preventDefault();

              handleDrop(status);
            }}
          >
            <div className="board-column-header">
              <h3>{status}</h3>

              <span className="board-count">
                {contractsForStatus.length}
              </span>
            </div>

            <div className="board-column-body">
              {contractsForStatus.length === 0 ? (
                <div className="board-empty">
                  Drop contract here
                </div>
              ) : (
                contractsForStatus.map(
                  (contract) => (
                    <button
                      key={contract.id}
                      type="button"
                      className={`board-card ${
                        draggedContractId ===
                        contract.id
                          ? "board-card-dragging"
                          : ""
                      }`}
                      draggable
                      onDragStart={(event) => {
                        setDraggedContractId(
                          contract.id
                        );

                        event.dataTransfer.effectAllowed =
                          "move";

                        event.dataTransfer.setData(
                          "contractId",
                          String(contract.id)
                        );
                      }}
                      onDragEnd={() => {
                        setDraggedContractId(null);
                        setDragOverStatus(null);
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
                        {contract.department ||
                          "No department"}
                      </span>

                      {contract.contract_start_date && (
                        <span className="board-card-date">
                          Starts{" "}
                          {
                            contract.contract_start_date
                          }
                        </span>
                      )}
                    </button>
                  )
                )
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}

export default ContractBoard;