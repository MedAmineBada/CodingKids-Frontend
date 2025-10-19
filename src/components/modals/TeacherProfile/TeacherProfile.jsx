import React, { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import styles from "./TeacherProfile.module.css";
import MediaQuery from "react-responsive";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

import {
  getFormations,
  getFormationsByTeacher,
  getTypes,
  unassignFormation,
} from "@/services/FormationServices.js";

import ConfirmModal from "@/components/modals/GenericModals/ConfirmModal.jsx";
import SuccessModal from "@/components/modals/GenericModals/SuccessModal.jsx";
import ErrorModal from "@/components/modals/GenericModals/ErrorModal.jsx";
import Modal from "react-bootstrap/Modal";

/**
 * TeacherProfile
 *
 * - Shows teacher info on first slide.
 * - Second slide lists assigned formations (name + X to unassign).
 * - Assign modal still present (no UI trigger) — you removed the + button.
 *
 * Props:
 * - data: { id, name, cin, tel, email, role }
 */
function TeacherProfile({ data = {} }) {
  const { id: teacherId, name, cin, tel, email, role } = data;

  const [formLoading, setFormLoading] = useState(false);
  const [formsError, setFormsError] = useState(null);
  const [formations, setFormations] = useState([]);
  const [typesMap, setTypesMap] = useState({});

  // confirm / processing / feedback
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [successOpen, setSuccessOpen] = useState(false);
  const [successTitle, setSuccessTitle] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [errOpen, setErrOpen] = useState(false);
  const [errCode, setErrCode] = useState(null);
  const [errMessage, setErrMessage] = useState("");

  // assign modal open (no visible trigger as requested)
  const [showAssignModal, setShowAssignModal] = useState(false);

  // utility: copy to clipboard
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

  const loadTypes = useCallback(async () => {
    try {
      const res = await getTypes();
      let data = [];
      if (Array.isArray(res)) data = res;
      else if (res?.data && Array.isArray(res.data)) data = res.data;
      else if (res?.items && Array.isArray(res.items)) data = res.items;
      else if (res && typeof res === "object") {
        const maybe = Object.values(res).find((v) => Array.isArray(v));
        if (Array.isArray(maybe)) data = maybe;
      }
      const map = {};
      data.forEach((t) => {
        map[String(t.id)] = t.label;
      });
      setTypesMap(map);
    } catch (err) {
      console.error("loadTypes error:", err);
      setTypesMap({});
    }
  }, []);

  const loadFormations = useCallback(async (tid) => {
    if (!tid) {
      setFormations([]);
      return;
    }
    setFormLoading(true);
    setFormsError(null);
    try {
      const res = await getFormationsByTeacher(tid);
      let items = [];
      if (Array.isArray(res)) items = res;
      else if (res?.formations && Array.isArray(res.formations))
        items = res.formations;
      else if (res && typeof res === "object") {
        const maybe = Object.values(res).find((v) => Array.isArray(v));
        if (Array.isArray(maybe)) items = maybe;
      }
      setFormations(items);
    } catch (err) {
      console.error("getFormationsByTeacher error:", err);
      setFormsError("Impossible de charger les formations de cet enseignant.");
      setFormations([]);
    } finally {
      setFormLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!teacherId) {
      setFormations([]);
      return;
    }
    loadTypes();
    loadFormations(teacherId);
  }, [teacherId, loadFormations, loadTypes]);

  function handleUnassignClick(formation) {
    setConfirmTarget(formation);
    setShowConfirm(true);
  }

  async function executeUnassign() {
    if (!confirmTarget) return;
    if (!teacherId) {
      setErrCode(400);
      setErrMessage("Enseignant introuvable.");
      setErrOpen(true);
      setShowConfirm(false);
      return;
    }
    setIsProcessing(true);
    try {
      const status = await unassignFormation(teacherId, confirmTarget.id);

      if (status >= 200 && status < 300) {
        setSuccessTitle("Dissociation effectuée");
        setSuccessMessage("La formation a été retirée de l’enseignant.");
        setSuccessOpen(true);
        setShowConfirm(false);
      } else if (status === 422) {
        setErrCode(422);
        setErrMessage("Erreur dans les données saisies.");
        setErrOpen(true);
        setShowConfirm(false);
      } else {
        setErrCode(status ?? 500);
        setErrMessage("Une erreur est survenue lors de la dissociation.");
        setErrOpen(true);
        setShowConfirm(false);
      }
    } catch (err) {
      setErrCode(500);
      setErrMessage("Une erreur est survenue lors de la dissociation.");
      setErrOpen(true);
      setShowConfirm(false);
    } finally {
      setIsProcessing(false);
      setConfirmTarget(null);
      // refresh assigned formations
      loadFormations(teacherId);
    }
  }

  function onSuccessClose() {
    setSuccessOpen(false);
    setSuccessTitle("");
    setSuccessMessage("");
    loadFormations(teacherId);
  }

  // --- AssignFormationModal (inner component)
  function AssignFormationModal({ show, onClose, onAssigned }) {
    const [avail, setAvail] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [assigningId, setAssigningId] = useState(null);

    useEffect(() => {
      if (!show) return;
      let cancelled = false;
      (async () => {
        setLoading(true);
        setError(null);
        try {
          const res = await getFormations(); // fetch all formations
          let data = [];
          if (Array.isArray(res)) data = res;
          else if (res?.data && Array.isArray(res.data)) data = res.data;
          else if (res?.items && Array.isArray(res.items)) data = res.items;
          else if (res && typeof res === "object") {
            const maybe = Object.values(res).find((v) => Array.isArray(v));
            if (Array.isArray(maybe)) data = maybe;
          }

          // Filter unassigned formations (teacher_id falsy) — fallback show all if none
          const unassigned = data.filter((f) => !f.teacher_id);
          const listToShow = unassigned.length > 0 ? unassigned : data;
          if (!cancelled) setAvail(listToShow);
        } catch (err) {
          console.error("getFormations for assign error:", err);
          if (!cancelled) setError("Impossible de charger les formations.");
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [show]);

    async function handleAssign(formation) {
      if (!teacherId || !formation?.id) {
        setError("Données invalides.");
        return;
      }
      setAssigningId(formation.id);
      try {
        const status = await assignFormation(teacherId, formation.id);
        if (status >= 200 && status < 300) {
          setSuccessTitle("Formation assignée");
          setSuccessMessage("La formation a été assignée à l’enseignant.");
          setSuccessOpen(true);
          onAssigned?.();
          onClose?.();
        } else if (status === 422) {
          setErrCode(422);
          setErrMessage("Erreur dans les données saisies.");
          setErrOpen(true);
        } else {
          setErrCode(status ?? 500);
          setErrMessage("Une erreur est survenue lors de l’assignation.");
          setErrOpen(true);
        }
      } catch (err) {
        console.error("assignFormation error:", err);
        setErrCode(500);
        setErrMessage("Une erreur est survenue lors de l’assignation.");
        setErrOpen(true);
      } finally {
        setAssigningId(null);
      }
    }

    return (
      <>
        <ErrorModal
          show={errOpen}
          onClose={() => setErrOpen(false)}
          code={errCode}
          message={errMessage}
        />
        <div>
          <Modal
            show={show}
            onHide={onClose}
            size="m"
            centered
            scrollable
            className={styles.modal}
          >
            <Modal.Header closeButton className={styles.header}>
              <h2 className={styles.title}>Assigner une formation</h2>
            </Modal.Header>

            <Modal.Body className={styles.body}>
              {loading && (
                <div className={styles.message}>Chargement des formations…</div>
              )}
              {error && <div className={styles.error}>{error}</div>}
              {!loading && avail.length === 0 && !error && (
                <div className={styles.message}>
                  Aucune formation disponible.
                </div>
              )}

              <div className={styles.rows}>
                {avail.map((f) => {
                  const label =
                    typesMap[String(f.formation_type)] ??
                    `Type #${f.formation_type}`;
                  const busy = assigningId === f.id;
                  return (
                    <div key={f.id} className={styles.formRow}>
                      <div className={styles.formInfo}>
                        <div className={styles.formLabel}>{label}</div>
                      </div>

                      <div className={styles.rowActions}>
                        <button
                          type="button"
                          className={styles.addBtn}
                          onClick={() => handleAssign(f)}
                          disabled={busy}
                          aria-label={`Assigner ${label}`}
                        >
                          {busy ? "…" : "Assigner"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Modal.Body>
          </Modal>
        </div>
      </>
    );
  }

  return (
    <>
      <ErrorModal
        show={errOpen}
        onClose={() => setErrOpen(false)}
        code={errCode}
        message={errMessage}
      />

      <SuccessModal
        show={successOpen}
        title={successTitle}
        message={successMessage}
        onClose={onSuccessClose}
      />

      <ConfirmModal
        show={showConfirm}
        onClose={() => {
          if (!isProcessing) {
            setShowConfirm(false);
            setConfirmTarget(null);
          }
        }}
        title="Confirmer la dissociation"
        message={
          confirmTarget
            ? `Retirer la formation “${typesMap[String(confirmTarget.formation_type)] ?? `#${confirmTarget.formation_type}`}” de ${name ?? "l'enseignant"} ?`
            : "Voulez-vous continuer ?"
        }
        btn_yes="Retirer"
        btn_no="Annuler"
        func={executeUnassign}
      />

      <AssignFormationModal
        show={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        onAssigned={() => loadFormations(teacherId)}
      />

      <MediaQuery maxWidth={999.99}>
        <Swiper
          rewind={false}
          navigation={true}
          modules={[Navigation]}
          className="mySwiper"
        >
          <SwiperSlide>
            <div className={styles.slideInner}>
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
                          className={styles.iconBtnSmall}
                          onClick={() => copyToClipboard(cin)}
                          aria-label="Copier le CIN"
                          title="Copier le CIN"
                        >
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <rect
                              x="9"
                              y="2"
                              width="7"
                              height="2"
                              rx="1"
                              stroke="currentColor"
                              strokeWidth="1.2"
                            />
                            <rect
                              x="5"
                              y="5"
                              width="14"
                              height="16"
                              rx="2"
                              stroke="currentColor"
                              strokeWidth="1.2"
                            />
                          </svg>
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
                            className={styles.iconBtnSmall}
                            onClick={() => copyToClipboard(tel)}
                            aria-label="Copier le numéro"
                            title="Copier le numéro"
                          >
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <rect
                                x="9"
                                y="2"
                                width="7"
                                height="2"
                                rx="1"
                                stroke="currentColor"
                                strokeWidth="1.2"
                              />
                              <rect
                                x="5"
                                y="5"
                                width="14"
                                height="16"
                                rx="2"
                                stroke="currentColor"
                                strokeWidth="1.2"
                              />
                            </svg>
                          </button>

                          <a
                            className={styles.iconBtnSmall}
                            href={`sms:${tel}`}
                            title="Envoyer un SMS"
                            aria-label="Envoyer un SMS"
                          >
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M22 4H2v14h6l2 2 2-2h10V4z"
                                stroke="currentColor"
                                strokeWidth="1.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
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
                          className={styles.iconBtnSmall}
                          onClick={() => copyToClipboard(email)}
                          aria-label="Copier l’e-mail"
                          title="Copier l’e-mail"
                        >
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M3 8l9 6 9-6"
                              stroke="currentColor"
                              strokeWidth="1.2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <rect
                              x="3"
                              y="4"
                              width="18"
                              height="16"
                              rx="2"
                              stroke="currentColor"
                              strokeWidth="1.2"
                            />
                          </svg>
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
            </div>
          </SwiperSlide>

          <SwiperSlide>
            <div className={styles.slideInner}>
              <div className={styles.listWrap}>
                <div className={styles.listHeader}>
                  <h3>Formations assignées</h3>
                  {/* + button intentionally removed as requested */}
                </div>

                {formLoading && (
                  <div className={styles.message}>Chargement…</div>
                )}
                {formsError && <div className={styles.error}>{formsError}</div>}
                {!formLoading && formations.length === 0 && !formsError && (
                  <div className={styles.empty}>Aucune formation assignée.</div>
                )}

                <div className={styles.rows}>
                  {formations.map((fr) => {
                    const label =
                      typesMap[String(fr.formation_type)] ??
                      `Type #${fr.formation_type}`;
                    return (
                      <div key={fr.id} className={styles.formRow}>
                        <div className={styles.formInfo}>
                          <div className={styles.formLabel}>{label}</div>
                        </div>

                        <div className={styles.rowActions}>
                          <button
                            type="button"
                            className={styles.unassignBtn}
                            onClick={() => handleUnassignClick(fr)}
                            title="Retirer de l'enseignant"
                            aria-label="Retirer"
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M18 6L6 18M6 6l12 12"
                                stroke="currentColor"
                                strokeWidth="1.6"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </SwiperSlide>
        </Swiper>
      </MediaQuery>

      <MediaQuery minWidth={1000}>
        <Swiper
          rewind={false}
          navigation={true}
          modules={[Navigation]}
          className="mySwiper"
        >
          <SwiperSlide>
            <div className={styles.slideInner}>
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
                          className={styles.iconBtnSmall}
                          onClick={() => copyToClipboard(cin)}
                          aria-label="Copier le CIN"
                        >
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <rect
                              x="9"
                              y="2"
                              width="7"
                              height="2"
                              rx="1"
                              stroke="currentColor"
                              strokeWidth="1.2"
                            />
                            <rect
                              x="5"
                              y="5"
                              width="14"
                              height="16"
                              rx="2"
                              stroke="currentColor"
                              strokeWidth="1.2"
                            />
                          </svg>
                        </button>
                      )}
                    </dd>
                  </div>

                  <div className={styles.row}>
                    <dt className={styles.label}>Téléphone</dt>
                    <dd className={styles.value}>
                      {tel ? (
                        <span className={styles.textVal}>{tel}</span>
                      ) : (
                        <span className={styles.textVal}>—</span>
                      )}
                      {tel && (
                        <div className={styles.rowActions}>
                          <button
                            type="button"
                            className={styles.iconBtnSmall}
                            onClick={() => copyToClipboard(tel)}
                            aria-label="Copier le numéro"
                          >
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <rect
                                x="9"
                                y="2"
                                width="7"
                                height="2"
                                rx="1"
                                stroke="currentColor"
                                strokeWidth="1.2"
                              />
                              <rect
                                x="5"
                                y="5"
                                width="14"
                                height="16"
                                rx="2"
                                stroke="currentColor"
                                strokeWidth="1.2"
                              />
                            </svg>
                          </button>

                          <a
                            className={styles.iconBtnSmall}
                            href={`sms:${tel}`}
                            title="Envoyer un SMS"
                            aria-label="Envoyer un SMS"
                          >
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M22 4H2v14h6l2 2 2-2h10V4z"
                                stroke="currentColor"
                                strokeWidth="1.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </a>
                        </div>
                      )}
                    </dd>
                  </div>

                  <div className={styles.row}>
                    <dt className={styles.label}>E-mail</dt>
                    <dd className={styles.value}>
                      {email ? (
                        <span className={styles.textVal}>{email}</span>
                      ) : (
                        <span className={styles.textVal}>—</span>
                      )}
                      {email && (
                        <button
                          type="button"
                          className={styles.iconBtnSmall}
                          onClick={() => copyToClipboard(email)}
                          aria-label="Copier l’e-mail"
                        >
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M3 8l9 6 9-6"
                              stroke="currentColor"
                              strokeWidth="1.2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <rect
                              x="3"
                              y="4"
                              width="18"
                              height="16"
                              rx="2"
                              stroke="currentColor"
                              strokeWidth="1.2"
                            />
                          </svg>
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
            </div>
          </SwiperSlide>

          <SwiperSlide>
            <div className={styles.slideInner}>
              <div className={styles.listWrap}>
                <div className={styles.listHeader}>
                  <h3>Formations assignées</h3>
                  {/* + button intentionally removed as requested */}
                </div>

                {formLoading && (
                  <div className={styles.message}>Chargement…</div>
                )}
                {formsError && <div className={styles.error}>{formsError}</div>}
                {!formLoading && formations.length === 0 && !formsError && (
                  <div className={styles.empty}>Aucune formation assignée.</div>
                )}

                <div className={styles.rows}>
                  {formations.map((fr) => {
                    const label =
                      typesMap[String(fr.formation_type)] ??
                      `Type #${fr.formation_type}`;
                    return (
                      <div key={fr.id} className={styles.formRow}>
                        <div className={styles.formInfo}>
                          <div className={styles.formLabel}>{label}</div>
                        </div>

                        <div className={styles.rowActions}>
                          <button
                            type="button"
                            className={styles.unassignBtn}
                            onClick={() => handleUnassignClick(fr)}
                            title="Retirer de l'enseignant"
                            aria-label="Retirer"
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M18 6L6 18M6 6l12 12"
                                stroke="currentColor"
                                strokeWidth="1.6"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </SwiperSlide>
        </Swiper>
      </MediaQuery>
    </>
  );
}

TeacherProfile.propTypes = {
  data: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    cin: PropTypes.string,
    tel: PropTypes.string,
    email: PropTypes.string,
    role: PropTypes.string,
  }),
};

export default TeacherProfile;
