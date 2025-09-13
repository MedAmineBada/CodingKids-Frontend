import React, { useEffect, useMemo, useState } from "react";
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
  "Décembre",
];

function getMonthName(monthNumber) {
  if (!monthNumber || monthNumber < 1 || monthNumber > 12)
    return `Mois ${monthNumber}`;
  return MONTH_NAMES[monthNumber - 1];
}

function getUniqueYears(records) {
  const yearSet = new Set(records.map((r) => r.year));
  return Array.from(yearSet).sort((a, b) => b - a);
}

export default function PaymentCalendar({ records = [], onMonthClick }) {
  const yearsList = useMemo(() => getUniqueYears(records), [records]);

  const initialYear =
    yearsList.length > 0 ? yearsList[0] : new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(Number(initialYear));

  useEffect(() => {
    if (yearsList.length === 0) {
      setSelectedYear((prev) => prev ?? new Date().getFullYear());
      return;
    }
    if (!yearsList.includes(Number(selectedYear))) {
      setSelectedYear(yearsList[0]);
    }
  }, [yearsList, selectedYear]);

  const monthsForSelectedYear = useMemo(() => {
    return records
      .filter((r) => Number(r.year) === Number(selectedYear))
      .sort((a, b) => a.month - b.month);
  }, [records, selectedYear]);

  const total = monthsForSelectedYear.length;
  const MAX_COLS = 4;
  const cols = total <= MAX_COLS ? Math.max(1, total) : MAX_COLS;

  const containerStyle = {
    gridTemplateColumns: `repeat(${cols}, minmax(120px, 1fr))`,
    justifyContent: total <= MAX_COLS ? "center" : undefined,
  };

  function handlePrevYear() {
    const idx = yearsList.indexOf(Number(selectedYear));
    if (idx < yearsList.length - 1) setSelectedYear(yearsList[idx + 1]);
  }
  function handleNextYear() {
    const idx = yearsList.indexOf(Number(selectedYear));
    if (idx > 0) setSelectedYear(yearsList[idx - 1]);
  }

  return (
    <section className={styles.wrapper}>
      <header className={styles.headerRow}>
        <div className={styles.selectContainer}>
          <label htmlFor="year-select" className={styles.label}>
            Année
          </label>

          <div className={styles.controlsRow}>
            <button
              className={styles.iconBtn}
              onClick={handlePrevYear}
              disabled={
                yearsList.length === 0 ||
                yearsList.indexOf(Number(selectedYear)) === yearsList.length - 1
              }
            >
              ◀
            </button>

            <select
              id="year-select"
              className={styles.yearSelect}
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

            <button
              className={styles.iconBtn}
              onClick={handleNextYear}
              disabled={
                yearsList.length === 0 ||
                yearsList.indexOf(Number(selectedYear)) <= 0
              }
            >
              ▶
            </button>
          </div>
        </div>

        <div className={styles.legend}>
          <div className={styles.legendItem}>
            <span className={`${styles.badgeSmall} ${styles.paid}`} /> Payé
          </div>
          <div className={styles.legendItem}>
            <span className={`${styles.badgeSmall} ${styles.unpaid}`} /> Impayé
          </div>
        </div>
      </header>

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
          monthsForSelectedYear.map((record) => {
            const isPaid = Boolean(record.paid);
            const monthLabel = getMonthName(record.month);
            const key = `${record.year}-${record.month}`;

            return (
              <button
                key={key}
                className={styles.month}
                onClick={() => onMonthClick && onMonthClick(record)}
                title={
                  isPaid
                    ? typeof record.amount === "number"
                      ? `Payé: ${record.amount.toFixed(2)}DT`
                      : "Payé"
                    : "Impayé"
                }
              >
                <div className={styles.monthTop}>
                  <div className={styles.monthlabel}>{monthLabel}</div>
                  <div className={styles.monthMeta}>
                    <span
                      className={`${isPaid ? styles.paid : styles.unpaid} ${styles.badge}`}
                    >
                      {isPaid
                        ? typeof record.amount === "number"
                          ? `${record.amount.toFixed(2)}DT`
                          : "Payé"
                        : "Impayé"}
                    </span>
                  </div>
                </div>

                {typeof record.attended_days === "number" && (
                  <div className={styles.attendance}>
                    Présences: {record.attended_days}
                  </div>
                )}

                <div className={styles.monthFooter}>
                  <small className={styles.footerHint}>
                    Cliquez pour détails
                  </small>
                </div>
              </button>
            );
          })
        )}
      </div>
    </section>
  );
}
