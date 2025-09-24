import React from "react";
import PropTypes from "prop-types";
import styles from "./TeacherProfile.module.css";
import MediaQuery from "react-responsive";

function TeacherProfile({ data = {} }) {
  const { name, cin, tel, email, role } = data;

  const words = (name || "").split(" ").filter(Boolean);
  const initials =
    words.length === 0
      ? "—"
      : words.map((word) => word[0].toUpperCase()).join("");
  async function copyToClipboard(value) {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = value;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } catch {
        // ignore
      }
      document.body.removeChild(ta);
    }
  }

  return (
    <>
      <MediaQuery maxWidth={999.99}>
        <article
          className={styles.card}
          aria-label={`Profil de ${name || "enseignant"}`}
        >
          <header className={styles.header}>
            <div className={styles.title}>
              <h1 className={styles.name}>{name ?? "—"}</h1>
              {role && <p className={styles.role}>{role}</p>}
            </div>
          </header>

          <dl className={styles.details}>
            <div className={styles.row}>
              <dt className={styles.label}>CIN</dt>
              <dd className={styles.value}>
                <span className={styles.textVal}>{cin ?? "—"}</span>
                {cin && (
                  <button
                    type="button"
                    className={styles.copyBtn}
                    onClick={() => copyToClipboard(cin)}
                    aria-label="Copier le CIN"
                    title="Copier le CIN"
                  >
                    📋
                  </button>
                )}
              </dd>
            </div>

            <div className={styles.row}>
              <dt className={styles.label}>Téléphone</dt>
              <dd className={styles.value}>
                {tel ? (
                  <a
                    className={styles.link}
                    href={`tel:${tel}`}
                    aria-label={`Appeler ${name ?? "l’enseignant"}`}
                  >
                    <span className={styles.textVal}>{tel}</span>
                  </a>
                ) : (
                  <span className={styles.textVal}>—</span>
                )}
                {tel && (
                  <div className={styles.rowActions}>
                    <button
                      type="button"
                      className={styles.iconBtn}
                      onClick={() => copyToClipboard(tel)}
                      aria-label="Copier le numéro"
                      title="Copier le numéro"
                    >
                      📋
                    </button>
                    <a
                      className={styles.actionLink}
                      href={`sms:${tel}`}
                      title="Envoyer un SMS"
                      aria-label="Envoyer un SMS"
                    >
                      ✉️
                    </a>
                  </div>
                )}
              </dd>
            </div>

            <div className={styles.row}>
              <dt className={styles.label}>E-mail</dt>
              <dd className={styles.value}>
                {email ? (
                  <a
                    className={styles.link}
                    href={`mailto:${email}`}
                    aria-label={`Écrire à ${name ?? "l’enseignant"}`}
                  >
                    <span className={styles.textVal}>{email}</span>
                  </a>
                ) : (
                  <span className={styles.textVal}>—</span>
                )}
                {email && (
                  <button
                    type="button"
                    className={styles.copyBtn}
                    onClick={() => copyToClipboard(email)}
                    aria-label="Copier l’e-mail"
                    title="Copier l’e-mail"
                  >
                    📋
                  </button>
                )}
              </dd>
            </div>
          </dl>

          <footer className={styles.footer}>
            <button
              type="button"
              className={styles.contactBtn}
              onClick={() =>
                tel ? (window.location.href = `tel:${tel}`) : null
              }
              disabled={!tel}
              aria-disabled={!tel}
            >
              {tel ? "Appeler" : "Pas de téléphone"}
            </button>
            <button
              type="button"
              className={styles.contactBtnOutline}
              onClick={() =>
                email ? (window.location.href = `mailto:${email}`) : null
              }
              disabled={!email}
              aria-disabled={!email}
            >
              {email ? "Envoyer un e-mail" : "Pas d’e-mail"}
            </button>
          </footer>
        </article>
      </MediaQuery>
      <MediaQuery minWidth={1000}>
        <article
          className={styles.card}
          aria-label={`Profil de ${name || "enseignant"}`}
        >
          <header className={styles.header}>
            <div className={styles.title}>
              <h1 className={styles.name}>{name ?? "—"}</h1>
              {role && <p className={styles.role}>{role}</p>}
            </div>
          </header>

          <dl className={styles.details}>
            <div className={styles.row}>
              <dt className={styles.label}>CIN</dt>
              <dd className={styles.value}>
                <span className={styles.textVal}>{cin ?? "—"}</span>
                {cin && (
                  <button
                    type="button"
                    className={styles.copyBtn}
                    onClick={() => copyToClipboard(cin)}
                    aria-label="Copier le CIN"
                    title="Copier le CIN"
                  >
                    📋
                  </button>
                )}
              </dd>
            </div>

            <div className={styles.row}>
              <dt className={styles.label}>Téléphone</dt>
              <dd className={styles.value}>
                {tel ? (
                  <a
                    className={styles.link}
                    aria-label={`Appeler ${name ?? "l’enseignant"}`}
                  >
                    <span className={styles.textVal}>{tel}</span>
                  </a>
                ) : (
                  <span className={styles.textVal}>—</span>
                )}
                {tel && (
                  <div className={styles.rowActions}>
                    <button
                      type="button"
                      className={styles.iconBtn}
                      onClick={() => copyToClipboard(tel)}
                      aria-label="Copier le numéro"
                      title="Copier le numéro"
                    >
                      📋
                    </button>
                  </div>
                )}
              </dd>
            </div>

            <div className={styles.row}>
              <dt className={styles.label}>E-mail</dt>
              <dd className={styles.value}>
                {email ? (
                  <a
                    className={styles.link}
                    href={`mailto:${email}`}
                    aria-label={`Écrire à ${name ?? "l’enseignant"}`}
                  >
                    <span className={styles.textVal}>{email}</span>
                  </a>
                ) : (
                  <span className={styles.textVal}>—</span>
                )}
                {email && (
                  <button
                    type="button"
                    className={styles.copyBtn}
                    onClick={() => copyToClipboard(email)}
                    aria-label="Copier l’e-mail"
                    title="Copier l’e-mail"
                  >
                    📋
                  </button>
                )}
              </dd>
            </div>
          </dl>

          <footer className={styles.footer}>
            <button
              type="button"
              className={styles.contactBtn}
              onClick={() =>
                email ? (window.location.href = `mailto:${email}`) : null
              }
              disabled={!email}
              aria-disabled={!email}
            >
              {email ? "Envoyer un e-mail" : "Pas d’e-mail"}
            </button>
          </footer>
        </article>
      </MediaQuery>
    </>
  );
}

TeacherProfile.propTypes = {
  data: PropTypes.shape({
    name: PropTypes.string,
    cin: PropTypes.string,
    tel: PropTypes.string,
    email: PropTypes.string,
    role: PropTypes.string,
  }),
};

export default TeacherProfile;
