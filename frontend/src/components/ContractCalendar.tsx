import { useMemo, useState } from "react";
import type { Contract } from "../types";

type ContractCalendarProps = {
  contracts: Contract[];
  onContractClick: (contract: Contract) => void;
};

function ContractCalendar({
  contracts,
  onContractClick,
}: ContractCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();

    return new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    );
  });

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);

    const startDay = firstDayOfMonth.getDay();

    const calendarStart = new Date(
      year,
      month,
      1 - startDay
    );

    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(calendarStart);

      date.setDate(
        calendarStart.getDate() + index
      );

      return date;
    });
  }, [currentMonth]);

  function goToPreviousMonth() {
    setCurrentMonth(
      new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() - 1,
        1
      )
    );
  }

  function goToNextMonth() {
    setCurrentMonth(
      new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + 1,
        1
      )
    );
  }

  function goToCurrentMonth() {
    const today = new Date();

    setCurrentMonth(
      new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      )
    );
  }

  function formatDateKey(date: Date) {
    const year = date.getFullYear();

    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  function getContractsForDate(date: Date) {
    const dateKey = formatDateKey(date);

    return contracts.filter(
      (contract) =>
        contract.contract_start_date === dateKey
    );
  }

  const monthLabel =
    currentMonth.toLocaleDateString(
      undefined,
      {
        month: "long",
        year: "numeric",
      }
    );

  return (
    <div className="calendar-wrapper">
      <div className="calendar-toolbar">
        <div>
          <h3>{monthLabel}</h3>
          <p>
            Contracts are shown by start date.
          </p>
        </div>

        <div className="calendar-toolbar-actions">
          <button
            type="button"
            className="button button-secondary"
            onClick={goToCurrentMonth}
          >
            Today
          </button>

          <button
            type="button"
            className="calendar-nav-button"
            onClick={goToPreviousMonth}
            aria-label="Previous month"
          >
            ‹
          </button>

          <button
            type="button"
            className="calendar-nav-button"
            onClick={goToNextMonth}
            aria-label="Next month"
          >
            ›
          </button>
        </div>
      </div>

      <div className="calendar-weekdays">
        <div>Sun</div>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
      </div>

      <div className="calendar-grid">
        {calendarDays.map((date) => {
          const dateKey = formatDateKey(date);

          const contractsForDate =
            getContractsForDate(date);

          const isCurrentMonth =
            date.getMonth() ===
            currentMonth.getMonth();

          const today = new Date();

          const isToday =
            date.getFullYear() ===
              today.getFullYear() &&
            date.getMonth() ===
              today.getMonth() &&
            date.getDate() ===
              today.getDate();

          return (
            <div
              key={dateKey}
              className={[
                "calendar-day",
                !isCurrentMonth
                  ? "calendar-day-outside"
                  : "",
                isToday
                  ? "calendar-day-today"
                  : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <div className="calendar-day-number">
                {date.getDate()}
              </div>

              <div className="calendar-day-events">
                {contractsForDate.map(
                  (contract) => (
                    <button
                      key={contract.id}
                      type="button"
                      className="calendar-contract"
                      onClick={() =>
                        onContractClick(
                          contract
                        )
                      }
                    >
                      <strong>
                        {contract.kch_number}
                      </strong>

                      <span>
                        {
                          contract.institution_company_name
                        }
                      </span>
                    </button>
                  )
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ContractCalendar;