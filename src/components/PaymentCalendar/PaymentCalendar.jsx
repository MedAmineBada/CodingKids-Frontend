import React, { useMemo, useState } from "react";
import styles from "./PaymentCalendar.module.css";

const MONTH_NAMES = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Decembre",
];

function getMonthName(monthNumber) {
  if (!monthNumber || monthNumber < 1 || monthNumber > 12)
    return `Month ${monthNumber}`;
  return MONTH_NAMES[monthNumber - 1];
}

function getUniqueYears(records) {
  const yearSet = new Set(records.map((r) => r.year));
  return Array.from(yearSet).sort((a, b) => b - a);
}

export default function PaymentCalendar({ records = [] }) {
  const yearsList = useMemo(() => getUniqueYears(records), [records]);

  const [selectedYear, setSelectedYear] = useState(
    yearsList[0] ?? new Date().getFullYear(),
  );

  const monthsForSelectedYear = useMemo(() => {
    return records
      .filter((r) => r.year === Number(selectedYear))
      .sort((a, b) => a.month - b.month);
  }, [records, selectedYear]);

  // Layout logic:
  const total = monthsForSelectedYear.length;
  const MAX_COLS = 4;
  // use exactly `total` columns if there are <= 4 items, else use 4 columns
  const cols = total <= MAX_COLS ? Math.max(1, total) : MAX_COLS;
  const rows = Math.ceil(total / cols);

  // container inline style: dynamic number of columns and center small grids
  const containerStyle = {
    gridTemplateColumns: `repeat(${cols}, 1fr)`,
    // when total <= MAX_COLS we center the whole grid block to get that "middle" feeling
    justifyContent: total <= MAX_COLS ? "center" : undefined,
  };

  return (
    <div className={yearsList.length === 0 ? styles.topcont : styles.n}>
      <div className={styles.selectContainer}>
        <label htmlFor="year-select">Année</label>
        <select
          id="year-select"
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
        >
          {yearsList.length === 0 ? (
            <option value={selectedYear}>{selectedYear}</option>
          ) : (
            yearsList.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))
          )}
        </select>
      </div>
      <div
        className={
          monthsForSelectedYear.length === 0
            ? styles.containerEmpty
            : styles.container
        }
        style={monthsForSelectedYear.length === 0 ? undefined : containerStyle}
      >
        {monthsForSelectedYear.length === 0 ? (
          <div className={styles.aucune}>Aucun Paiement ni Présence.</div>
        ) : (
          monthsForSelectedYear.map((record, idx) => {
            const isPaid = Boolean(record.paid);
            const monthLabel = getMonthName(record.month);
            const key = `${record.year}-${record.month}`;

            // compute row/col placement for centering the last (possibly partially-filled) row
            if (total > MAX_COLS) {
              const rowIndex = Math.floor(idx / cols); // 0-based
              const isLastRow = rowIndex === rows - 1;
              if (isLastRow) {
                const itemsInLastRow = total - cols * (rows - 1); // can be 1..cols-1
                const startCol = Math.floor((cols - itemsInLastRow) / 2) + 1; // 1-based grid column
                const indexInRow = idx % cols;
                const gridColumnStart = startCol + indexInRow;
                // inline style to push these items to centered columns in last row
                return (
                  <div
                    key={key}
                    className={styles.month}
                    style={{
                      gridColumnStart,
                      gridRowStart: rowIndex + 1,
                    }}
                  >
                    <div className={styles.monthlabel}>{monthLabel}</div>

                    <div>
                      <span
                        className={`${isPaid ? styles.paid : styles.unpaid}`}
                      >
                        {isPaid
                          ? typeof record.amount === "number"
                            ? `Payé: ${record.amount.toFixed(2)}DT`
                            : "Payé"
                          : "Impayé"}
                      </span>
                    </div>
                    {typeof record.attended_days === "number" && (
                      <div>Présences: {record.attended_days}</div>
                    )}
                  </div>
                );
              }
            }

            return (
              <div key={key} className={styles.month}>
                <div className={styles.monthlabel}>{monthLabel}</div>

                <div>
                  <span className={`${isPaid ? styles.paid : styles.unpaid}`}>
                    {isPaid
                      ? typeof record.amount === "number"
                        ? `Payé: ${record.amount.toFixed(2)}DT`
                        : "Payé"
                      : "Impayé"}
                  </span>
                </div>
                {typeof record.attended_days === "number" && (
                  <div>Présences: {record.attended_days}</div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
