import React from "react";
import Modal from "react-bootstrap/Modal";
import styles from "./PaymentInfo.module.css";

/**
 * Format amount using Intl.NumberFormat for grouping and decimals.
 * Returns an object with sign, integer (grouped), decimals (2 digits) and full formatted string.
 */
function formatAmountParts(amount, locale = "fr-FR", currencyLabel = "DT") {
  if (amount === null || amount === undefined || amount === "") return null;
  const num = Number(amount);
  if (Number.isNaN(num)) return null;

  const sign = num < 0 ? "-" : "";
  const abs = Math.abs(num);
  const integerFormatter = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 0,
  });
  const integer = integerFormatter.format(Math.floor(abs));
  const decimals = Math.round((abs - Math.floor(abs)) * 100)
    .toString()
    .padStart(2, "0");

  const full = `${sign}${integer}${decimals ? "," + decimals : ""} ${currencyLabel}`;
  return { sign, integer, decimals, full };
}

function formatDate(dateString, locale = "fr-FR") {
  if (!dateString) return "-";
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return dateString;
  return d.toLocaleString(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function PaymentInfo({ show, onHide, onEdit, data = {}, loading = false }) {
  // defensive: if caller passed null explicitly, normalize to {}
  const safeData = data ?? {};

  const amtParts = formatAmountParts(safeData.amount);
  const formattedDate = safeData.payment_date
    ? formatDate(safeData.payment_date)
    : "-";
  const isNegative = Number(safeData.amount) < 0;

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      dialogClassName={styles.dialog}
      contentClassName={styles.content}
      aria-labelledby="payment-info-title"
    >
      <Modal.Header className={styles.head} closeButton>
        <h2 id="payment-info-title" className={styles.title}>
          Informations de paiement
        </h2>
      </Modal.Header>

      <Modal.Body className={styles.body}>
        {loading ? (
          <div className={styles.skeletonWrap}>
            <div className={styles.skeletonRow} />
            <div className={styles.skeletonRow} />
            <div className={styles.skeletonRowShort} />
          </div>
        ) : (
          <dl className={styles.grid}>
            {/* Date */}
            <div className={styles.row}>
              <dt className={styles.label}>Date</dt>
              <dd className={styles.value}>
                {safeData.payment_date ? (
                  <time dateTime={safeData.payment_date}>{formattedDate}</time>
                ) : (
                  <span className={styles.empty}>-</span>
                )}
              </dd>
            </div>

            {/* Amount */}
            <div className={styles.row}>
              <dt className={styles.label}>Montant</dt>
              <dd className={styles.value}>
                {amtParts ? (
                  <div
                    className={`${styles.amount} ${isNegative ? styles.negative : ""}`}
                    aria-label={`Montant ${amtParts.sign}${amtParts.integer} DT ${amtParts.decimals}`}
                  >
                    <div className={styles.amountMain}>
                      <span className={styles.amountInt}>
                        {amtParts.sign}
                        {amtParts.integer}
                      </span>
                      <span className={styles.amountCurrency}>DT</span>
                      <span className={styles.amountDec}>
                        ,{amtParts.decimals}
                      </span>
                    </div>
                  </div>
                ) : (
                  <span className={styles.empty}>-</span>
                )}
              </dd>
            </div>

            {/* Optional fields */}
            {safeData.payer ? (
              <div className={styles.row}>
                <dt className={styles.label}>Payé par</dt>
                <dd className={styles.value}>
                  <span>{safeData.payer}</span>
                </dd>
              </div>
            ) : null}

            {safeData.method ? (
              <div className={styles.row}>
                <dt className={styles.label}>Méthode</dt>
                <dd className={styles.value}>{safeData.method}</dd>
              </div>
            ) : null}

            {safeData.id ? (
              <div className={styles.row}>
                <dt className={styles.label}>Référence</dt>
                <dd className={styles.value}>
                  <span className={styles.mono}>{safeData.id}</span>
                </dd>
              </div>
            ) : null}

            {/* Note */}
            {safeData.note ? (
              <div className={styles.row}>
                <dt className={styles.label}>Note</dt>
                <dd className={styles.value}>
                  <div className={styles.note}>{safeData.note}</div>
                </dd>
              </div>
            ) : null}
          </dl>
        )}
      </Modal.Body>

      <Modal.Footer className={styles.footer}>
        <button
          type="button"
          className={`${styles.btn} ${styles.btnSecondary}`}
          onClick={onHide}
        >
          Fermer
        </button>

        <button
          type="button"
          className={`${styles.btn} ${styles.btnPrimary}`}
          onClick={() => (typeof onEdit === "function" ? onEdit() : onHide())}
        >
          Modifier
        </button>
      </Modal.Footer>
    </Modal>
  );
}

export default PaymentInfo;
