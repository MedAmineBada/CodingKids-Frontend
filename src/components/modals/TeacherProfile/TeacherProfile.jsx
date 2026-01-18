import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import styles from "./TeacherProfile.module.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { DayPicker } from "react-day-picker";
import { fr } from "date-fns/locale";
import Modal from "react-bootstrap/Modal";

import {
  assign,
  get_enrolled_students,
  getFormationDetails,
  getFormations,
  getFormationsByTeacher,
  getTypes,
  unassignFormation,
} from "@/services/FormationServices.js";

import {
  addSession,
  getSessions,
  removeSession,
} from "@/services/AttendanceService.js";

import { formatDateToYYYYMMDD } from "@/services/utils.js";

import ConfirmModal from "@/components/modals/GenericModals/ConfirmModal.jsx";
import SuccessModal from "@/components/modals/GenericModals/SuccessModal.jsx";
import ErrorModal from "@/components/modals/GenericModals/ErrorModal.jsx";

// ============ ICON COMPONENTS ============
const Icons = {
  Copy: memo(() => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  )),
  Phone: memo(() => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
    </svg>
  )),
  Message: memo(() => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  )),
  Mail: memo(() => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  )),
  Plus: memo(() => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )),
  Close: memo(() => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )),
  User: memo(() => (
    <svg
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )),
  Calendar: memo(() => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )),
  ChevronRight: memo(() => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )),
};

// ============ UTILITY FUNCTIONS ============
const copyToClipboard = async (value) => {
  if (!value) return false;
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = value;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      return true;
    } catch {
      return false;
    } finally {
      document.body.removeChild(ta);
    }
  }
};

const formatDateFR = (dateStr) => {
  if (!dateStr) return "—";
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
};

const formatDateHuman = (dateStr) => {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(dateStr));
};

// ============ SKELETON COMPONENTS ============
const Skeleton = memo(
  ({ width = "100%", height = "20px", borderRadius = "8px" }) => (
    <div className={styles.skeleton} style={{ width, height, borderRadius }} />
  ),
);

const FormationSkeleton = memo(() => (
  <div className={styles.skeletonRow}>
    <Skeleton width="60%" height="18px" />
    <Skeleton width="38px" height="38px" borderRadius="8px" />
  </div>
));

// ============ ICON BUTTON COMPONENT ============
const IconButton = memo(
  ({
    onClick,
    label,
    title,
    href,
    children,
    variant = "default",
    size = "medium",
  }) => {
    const className = `${styles.iconBtn} ${styles[`iconBtn--${variant}`]} ${styles[`iconBtn--${size}`]}`;

    if (href) {
      return (
        <a className={className} href={href} title={title} aria-label={label}>
          {children}
        </a>
      );
    }

    return (
      <button
        type="button"
        className={className}
        onClick={onClick}
        aria-label={label}
        title={title}
      >
        {children}
      </button>
    );
  },
);

// ============ COPY BUTTON WITH FEEDBACK ============
const CopyButton = memo(({ value, label }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    const success = await copyToClipboard(value);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [value]);

  return (
    <IconButton
      onClick={handleCopy}
      label={label}
      title={copied ? "Copié !" : label}
      variant={copied ? "success" : "default"}
    >
      {copied ? (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <Icons.Copy />
      )}
    </IconButton>
  );
});

// ============ INFO ROW COMPONENT ============
const InfoRow = memo(({ label, value, copyable, actions }) => (
  <div className={styles.infoRow}>
    <dt className={styles.infoLabel}>{label}</dt>
    <dd className={styles.infoValue}>
      <span className={styles.infoText}>{value || "—"}</span>
      {value && (
        <div className={styles.infoActions}>
          {copyable && (
            <CopyButton value={value} label={`Copier ${label.toLowerCase()}`} />
          )}
          {actions}
        </div>
      )}
    </dd>
  </div>
));

// ============ FORMATION ROW COMPONENT ============
const FormationRow = memo(({ formation, typeLabel, onUnassign, onClick }) => (
  <div
    className={styles.formationRow}
    onClick={onClick}
    role="button"
    tabIndex={0}
    onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onClick()}
  >
    <div className={styles.formationInfo}>
      <span className={styles.formationLabel}>{typeLabel}</span>
      <span className={styles.formationMeta}>
        <Icons.ChevronRight />
      </span>
    </div>
    <button
      type="button"
      className={styles.removeBtn}
      onClick={(e) => {
        e.stopPropagation();
        onUnassign();
      }}
      title="Retirer de l'enseignant"
      aria-label="Retirer"
    >
      <Icons.Close />
    </button>
  </div>
));

// ============ MONTH SESSIONS BADGE ============
const MonthSessionsBadge = memo(({ month, sessions }) => {
  const count = useMemo(() => {
    const year = month.getFullYear();
    const m = month.getMonth();
    return (sessions ?? []).filter((d) => {
      const date = new Date(d);
      return date.getFullYear() === year && date.getMonth() === m;
    }).length;
  }, [month, sessions]);

  const monthName = useMemo(
    () =>
      new Intl.DateTimeFormat("fr-FR", {
        month: "long",
        year: "numeric",
      }).format(month),
    [month],
  );

  return (
    <div className={styles.monthBadge}>
      <span className={styles.monthBadgeLabel}>{monthName}</span>
      <span className={styles.monthBadgeCount}>
        {count} session{count !== 1 ? "s" : ""}
      </span>
    </div>
  );
});

// ============ ASSIGN FORMATION MODAL ============
const AssignFormationModal = memo(
  ({
    show,
    onClose,
    onAssigned,
    assignedFormations = [],
    teacherId,
    typesMap,
    showSuccess,
    showError,
  }) => {
    const [avail, setAvail] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [assigningId, setAssigningId] = useState(null);

    const assignedIds = useMemo(
      () => assignedFormations.map((f) => f.id),
      [assignedFormations],
    );

    useEffect(() => {
      if (!show) return;
      let cancelled = false;

      const load = async () => {
        setLoading(true);
        setError(null);
        try {
          const res = await getFormations();
          let data =
            res?.formations ??
            res?.data ??
            res?.items ??
            (Array.isArray(res) ? res : []);
          if (!Array.isArray(data)) {
            const maybe = Object.values(res || {}).find((v) =>
              Array.isArray(v),
            );
            data = Array.isArray(maybe) ? maybe : [];
          }

          const available = data.filter((f) => !assignedIds.includes(f.id));
          const unassigned = available.filter((f) => !f.teacher_id);

          if (!cancelled)
            setAvail(unassigned.length > 0 ? unassigned : available);
        } catch (err) {
          console.error("getFormations error:", err);
          if (!cancelled) setError("Impossible de charger les formations.");
        } finally {
          if (!cancelled) setLoading(false);
        }
      };

      load();
      return () => {
        cancelled = true;
      };
    }, [show, assignedIds]);

    const handleAssign = useCallback(
      async (formation) => {
        if (!teacherId || !formation?.id) {
          setError("Données invalides.");
          return;
        }
        setAssigningId(formation.id);
        try {
          const status = await assign(teacherId, formation.id);
          if (status >= 200 && status < 300) {
            showSuccess(
              "Formation assignée",
              "La formation a été assignée à l'enseignant.",
            );
            onAssigned?.();
            onClose?.();
          } else {
            showError(
              status,
              status === 422
                ? "Erreur dans les données saisies."
                : "Une erreur est survenue.",
            );
          }
        } catch {
          showError(500, "Une erreur est survenue lors de l'assignation.");
        } finally {
          setAssigningId(null);
        }
      },
      [teacherId, onAssigned, onClose, showSuccess, showError],
    );

    return (
      <Modal
        show={show}
        onHide={onClose}
        size="md"
        centered
        scrollable
        className={styles.modal}
      >
        <Modal.Header closeButton className={styles.modalHeader}>
          <Modal.Title className={styles.modalTitle}>
            <Icons.Plus />
            Assigner une formation
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className={styles.modalBody}>
          {loading && (
            <div className={styles.loadingState}>
              {[1, 2, 3].map((i) => (
                <FormationSkeleton key={i} />
              ))}
            </div>
          )}

          {error && <div className={styles.errorState}>{error}</div>}

          {!loading && avail.length === 0 && !error && (
            <div className={styles.emptyState}>
              <Icons.Calendar />
              <p>Aucune formation disponible</p>
            </div>
          )}

          <div className={styles.assignList}>
            {avail.map((f) => {
              const label =
                typesMap[String(f.formation_type)] ??
                `Type #${f.formation_type}`;
              const busy = assigningId === f.id;
              return (
                <div key={f.id} className={styles.assignRow}>
                  <span className={styles.assignLabel}>{label}</span>
                  <button
                    type="button"
                    className={styles.assignBtn}
                    onClick={() => handleAssign(f)}
                    disabled={busy}
                    aria-label={`Assigner ${label}`}
                  >
                    {busy ? (
                      <span className={styles.btnSpinner} />
                    ) : (
                      <Icons.Plus />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </Modal.Body>
      </Modal>
    );
  },
);

// ============ FORMATION DETAILS MODAL ============
const FormationDetailsModal = memo(({ show, onClose, formation, typesMap }) => {
  const [details, setDetails] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!show || !formation?.id) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const [detailsRes, studentsRes] = await Promise.all([
          getFormationDetails(formation.id),
          get_enrolled_students(formation.id),
        ]);

        if (!cancelled) {
          setDetails(detailsRes?.details ?? detailsRes ?? null);
          setStudents(
            studentsRes?.students ??
              (Array.isArray(studentsRes) ? studentsRes : []),
          );
        }
      } catch (err) {
        console.error("Error loading formation details:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [show, formation?.id]);

  const typeLabel = useMemo(
    () =>
      details?.type_label ??
      typesMap[String(formation?.formation_type)] ??
      "Formation",
    [details, typesMap, formation],
  );

  return (
    <Modal
      show={show}
      onHide={onClose}
      size="lg"
      centered
      scrollable
      className={styles.modal}
    >
      <Modal.Header closeButton className={styles.modalHeader}>
        <Modal.Title className={styles.modalTitle}>{typeLabel}</Modal.Title>
      </Modal.Header>

      <Modal.Body className={styles.modalBody}>
        {loading ? (
          <div className={styles.detailsLoading}>
            <div className={styles.spinner} />
            <span>Chargement des détails…</span>
          </div>
        ) : (
          <div className={styles.detailsGrid}>
            <section className={styles.detailsSection}>
              <h3 className={styles.sectionTitle}>Informations</h3>

              <div className={styles.detailsCard}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Type</span>
                  <span className={styles.detailValue}>{typeLabel}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Date de début</span>
                  <span className={styles.detailValue}>
                    {formatDateFR(details?.start_date)}
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Enseignant</span>
                  <span className={styles.detailValue}>
                    {details?.teacher_name ?? "—"}
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>ID</span>
                  <span className={styles.detailValue}>
                    #{details?.id ?? formation?.id ?? "—"}
                  </span>
                </div>
              </div>

              <div className={styles.statsCard}>
                <div className={styles.statItem}>
                  <span className={styles.statNumber}>{students.length}</span>
                  <span className={styles.statLabel}>
                    Étudiant{students.length !== 1 ? "s" : ""} inscrit
                    {students.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </section>

            <section className={styles.studentsSection}>
              <h3 className={styles.sectionTitle}>Étudiants inscrits</h3>

              {students.length === 0 ? (
                <div className={styles.emptyStudents}>
                  <Icons.User />
                  <span>Aucun étudiant inscrit</span>
                </div>
              ) : (
                <ul className={styles.studentsList}>
                  {students.map((student, index) => (
                    <li
                      key={student.id ?? index}
                      className={styles.studentItem}
                    >
                      <div className={styles.studentAvatar}>
                        {student.name?.charAt(0)?.toUpperCase() ?? "?"}
                      </div>
                      <span className={styles.studentName}>{student.name}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
});

// ============ MAIN COMPONENT ============
function TeacherProfile({ data = {} }) {
  const { id: teacherId, name, cin, tel, email, role } = data;

  // State
  const [formLoading, setFormLoading] = useState(false);
  const [formsError, setFormsError] = useState(null);
  const [formations, setFormations] = useState([]);
  const [typesMap, setTypesMap] = useState({});
  const [selectedDays, setSelectedDays] = useState([]);
  const [displayedMonth, setDisplayedMonth] = useState(new Date());

  // Modal states
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedFormation, setSelectedFormation] = useState(null);
  const [showActionConfirm, setShowActionConfirm] = useState(false);
  const [actionConfirmData, setActionConfirmData] = useState({
    title: "",
    message: "",
    func: null,
  });

  // Feedback states
  const [feedback, setFeedback] = useState({
    type: null,
    title: "",
    message: "",
    show: false,
  });

  const currentYear = new Date().getFullYear();
  const endMonth = useMemo(
    () => new Date(currentYear + 1, 11, 31),
    [currentYear],
  );

  // Feedback helpers
  const showSuccess = useCallback((title, message) => {
    setFeedback({ type: "success", title, message, show: true });
  }, []);

  const showError = useCallback(
    (code = 500, message = "Une erreur s'est produite") => {
      setFeedback({
        type: "error",
        title: `Erreur ${code}`,
        message,
        show: true,
      });
    },
    [],
  );

  const closeFeedback = useCallback(() => {
    setFeedback((prev) => ({ ...prev, show: false }));
    if (feedback.type === "success") loadFormations(teacherId);
  }, [feedback.type, teacherId]);

  // Data loaders
  const loadTypes = useCallback(async () => {
    try {
      const res = await getTypes();
      let data =
        res?.types ??
        res?.data ??
        res?.items ??
        (Array.isArray(res) ? res : []);
      if (!Array.isArray(data)) {
        const maybe = Object.values(res || {}).find((v) => Array.isArray(v));
        data = Array.isArray(maybe) ? maybe : [];
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
      let items = res?.formations ?? (Array.isArray(res) ? res : []);
      if (!Array.isArray(items)) {
        const maybe = Object.values(res || {}).find((v) => Array.isArray(v));
        items = Array.isArray(maybe) ? maybe : [];
      }
      setFormations(items);
    } catch (err) {
      console.error("getFormationsByTeacher error:", err);
      setFormsError("Impossible de charger les formations.");
      setFormations([]);
    } finally {
      setFormLoading(false);
    }
  }, []);

  const loadSessions = useCallback(
    async (tid) => {
      if (!tid) return;
      try {
        const result = await getSessions(tid);
        setSelectedDays(Array.isArray(result?.dates) ? result.dates : []);
      } catch {
        setSelectedDays([]);
        showError(500, "Impossible de charger les sessions.");
      }
    },
    [showError],
  );

  // Session handlers
  const handleAddSession = useCallback(
    async (dayYmd) => {
      if (!teacherId) return showError(400, "ID enseignant manquant.");
      try {
        const { status } = await addSession(teacherId, dayYmd);
        if (status === 201) {
          setSelectedDays((prev) => {
            if (prev.includes(dayYmd)) return prev;
            return [...prev, dayYmd].sort();
          });
        } else if (status === 409) {
          showError(status, "L'enseignant a déjà une session à cette date.");
        } else {
          showError(status);
        }
      } catch {
        showError(500, "Une erreur s'est produite.");
      } finally {
        setShowActionConfirm(false);
      }
    },
    [teacherId, showError],
  );

  const handleRemoveSession = useCallback(
    async (dayYmd) => {
      if (!teacherId) return showError(400, "ID enseignant manquant.");
      try {
        const { status } = await removeSession(teacherId, dayYmd);
        if (status === 200) {
          setSelectedDays((prev) => prev.filter((d) => d !== dayYmd));
        } else {
          showError(status);
        }
      } catch {
        showError(500, "Une erreur s'est produite.");
      } finally {
        setShowActionConfirm(false);
      }
    },
    [teacherId, showError],
  );

  const handleDayPickerSelect = useCallback(
    (days) => {
      if (!days) {
        setSelectedDays([]);
        return;
      }

      const currentDays = (selectedDays ?? []).map((d) =>
        formatDateToYYYYMMDD(new Date(d)),
      );
      const newDays = (Array.isArray(days) ? days : [days]).map((d) =>
        formatDateToYYYYMMDD(d),
      );

      const added = newDays.find((d) => !currentDays.includes(d));
      const removed = currentDays.find((d) => !newDays.includes(d));

      if (added) {
        setActionConfirmData({
          title: "Ajouter une session",
          message: `Ajouter une session le ${formatDateHuman(added)} ?`,
          func: () => handleAddSession(added),
        });
        setShowActionConfirm(true);
      } else if (removed) {
        setActionConfirmData({
          title: "Supprimer la session",
          message: `Supprimer la session du ${formatDateHuman(removed)} ?`,
          func: () => handleRemoveSession(removed),
        });
        setShowActionConfirm(true);
      }
    },
    [selectedDays, handleAddSession, handleRemoveSession],
  );

  const handleAddSessionToday = useCallback(async () => {
    const today = new Date().toISOString().split("T")[0];
    setActionConfirmData({
      title: "Ajouter une session",
      message: "Ajouter une session pour aujourd'hui ?",
      func: () => handleAddSession(today),
    });
    setShowActionConfirm(true);
  }, [handleAddSession]);

  // Unassign handler
  const executeUnassign = useCallback(async () => {
    if (!confirmTarget || !teacherId) {
      showError(400, "Données manquantes.");
      setShowConfirm(false);
      return;
    }
    setIsProcessing(true);
    try {
      const status = await unassignFormation(teacherId, confirmTarget.id);
      if (status >= 200 && status < 300) {
        showSuccess("Dissociation effectuée", "La formation a été retirée.");
      } else {
        showError(status, "Erreur lors de la dissociation.");
      }
    } catch {
      showError(500, "Erreur lors de la dissociation.");
    } finally {
      setIsProcessing(false);
      setShowConfirm(false);
      setConfirmTarget(null);
      loadFormations(teacherId);
    }
  }, [confirmTarget, teacherId, showSuccess, showError, loadFormations]);

  // Effects
  useEffect(() => {
    if (!teacherId) {
      setFormations([]);
      setSelectedDays([]);
      return;
    }
    loadTypes();
    loadFormations(teacherId);
    loadSessions(teacherId);
  }, [teacherId, loadFormations, loadTypes, loadSessions]);

  // Memoized values
  const selectedDates = useMemo(
    () => (selectedDays ?? []).map((d) => new Date(d)),
    [selectedDays],
  );

  return (
    <>
      {/* Feedback Modals */}
      {feedback.type === "error" && (
        <ErrorModal
          show={feedback.show}
          onClose={closeFeedback}
          code={parseInt(feedback.title.replace("Erreur ", ""), 10)}
          message={feedback.message}
        />
      )}
      {feedback.type === "success" && (
        <SuccessModal
          show={feedback.show}
          title={feedback.title}
          message={feedback.message}
          onClose={closeFeedback}
        />
      )}

      {/* Confirm Modals */}
      <ConfirmModal
        show={showConfirm}
        onClose={() => !isProcessing && setShowConfirm(false)}
        title="Confirmer la dissociation"
        message={
          confirmTarget
            ? `Retirer la formation "${typesMap[String(confirmTarget.formation_type)] ?? confirmTarget.formation_type}" de ${name ?? "l'enseignant"} ?`
            : ""
        }
        btn_yes="Retirer"
        btn_no="Annuler"
        func={executeUnassign}
      />

      <ConfirmModal
        show={showActionConfirm}
        onClose={() => setShowActionConfirm(false)}
        title={actionConfirmData.title}
        message={actionConfirmData.message}
        btn_yes="Confirmer"
        btn_no="Annuler"
        func={actionConfirmData.func}
      />

      {/* Other Modals */}
      <AssignFormationModal
        show={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        onAssigned={() => loadFormations(teacherId)}
        assignedFormations={formations}
        teacherId={teacherId}
        typesMap={typesMap}
        showSuccess={showSuccess}
        showError={showError}
      />

      <FormationDetailsModal
        show={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        formation={selectedFormation}
        typesMap={typesMap}
      />

      {/* Main Content */}
      <div className={styles.container}>
        <Swiper
          rewind={false}
          navigation
          modules={[Navigation]}
          className={styles.swiper}
          spaceBetween={20}
        >
          {/* Slide 1: Teacher Info */}
          <SwiperSlide>
            <div className={styles.slideContent}>
              <article className={styles.profileCard}>
                <header className={styles.profileHeader}>
                  <div className={styles.profileAvatar}>
                    {name?.charAt(0)?.toUpperCase() ?? "?"}
                  </div>
                  <div className={styles.profileTitle}>
                    <h1 className={styles.profileName}>{name ?? "—"}</h1>
                    {role && <span className={styles.profileRole}>{role}</span>}
                  </div>
                </header>

                <dl className={styles.profileDetails}>
                  <InfoRow label="CIN" value={cin} copyable />
                  <InfoRow
                    label="Téléphone"
                    value={tel}
                    copyable
                    actions={
                      tel && (
                        <>
                          <IconButton
                            href={`tel:${tel}`}
                            label="Appeler"
                            title="Appeler"
                          >
                            <Icons.Phone />
                          </IconButton>
                          <IconButton
                            href={`sms:${tel}`}
                            label="SMS"
                            title="Envoyer un SMS"
                          >
                            <Icons.Message />
                          </IconButton>
                        </>
                      )
                    }
                  />
                  <InfoRow
                    label="E-mail"
                    value={email}
                    copyable
                    actions={
                      email && (
                        <IconButton
                          href={`mailto:${email}`}
                          label="E-mail"
                          title="Envoyer un e-mail"
                        >
                          <Icons.Mail />
                        </IconButton>
                      )
                    }
                  />
                </dl>

                <footer className={styles.profileFooter}>
                  <div className={styles.footerActions}>
                    <button
                      type="button"
                      className={styles.primaryBtn}
                      onClick={() =>
                        tel && (window.location.href = `tel:${tel}`)
                      }
                      disabled={!tel}
                    >
                      <Icons.Phone />
                      {tel ? "Appeler" : "Pas de téléphone"}
                    </button>
                    <button
                      type="button"
                      className={styles.secondaryBtn}
                      onClick={() =>
                        email && (window.location.href = `mailto:${email}`)
                      }
                      disabled={!email}
                    >
                      <Icons.Mail />
                      {email ? "E-mail" : "Pas d'e-mail"}
                    </button>
                  </div>
                  <button
                    type="button"
                    className={styles.sessionBtn}
                    onClick={handleAddSessionToday}
                  >
                    <Icons.Plus />
                    Session aujourd'hui
                  </button>
                </footer>
              </article>
            </div>
          </SwiperSlide>

          {/* Slide 2: Formations */}
          <SwiperSlide>
            <div className={styles.slideContent}>
              <div className={styles.listCard}>
                <header className={styles.listHeader}>
                  <h2 className={styles.listTitle}>Formations assignées</h2>
                  <span className={styles.listBadge}>{formations.length}</span>
                </header>

                <div className={styles.listContent}>
                  <button
                    type="button"
                    className={styles.addFormationBtn}
                    onClick={() => setShowAssignModal(true)}
                  >
                    <Icons.Plus />
                    <span>Assigner une formation</span>
                  </button>

                  {formLoading && (
                    <div className={styles.loadingState}>
                      {[1, 2, 3].map((i) => (
                        <FormationSkeleton key={i} />
                      ))}
                    </div>
                  )}

                  {formsError && (
                    <div className={styles.errorState}>{formsError}</div>
                  )}

                  {!formLoading && formations.length === 0 && !formsError && (
                    <div className={styles.emptyFormations}>
                      <Icons.Calendar />
                      <p>Aucune formation assignée</p>
                    </div>
                  )}

                  <div className={styles.formationsList}>
                    {formations.map((f) => (
                      <FormationRow
                        key={f.id}
                        formation={f}
                        typeLabel={
                          typesMap[String(f.formation_type)] ??
                          `Type #${f.formation_type}`
                        }
                        onUnassign={() => {
                          setConfirmTarget(f);
                          setShowConfirm(true);
                        }}
                        onClick={() => {
                          setSelectedFormation(f);
                          setShowDetailsModal(true);
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>

          {/* Slide 3: Sessions Calendar */}
          <SwiperSlide>
            <div className={styles.slideContent}>
              <div className={styles.calendarCard}>
                <header className={styles.listHeader}>
                  <h2 className={styles.listTitle}>Sessions</h2>
                </header>

                <DayPicker
                  className={styles.calendar}
                  locale={fr}
                  captionLayout="dropdown"
                  animate
                  mode="multiple"
                  month={displayedMonth}
                  onMonthChange={setDisplayedMonth}
                  selected={selectedDates}
                  onSelect={handleDayPickerSelect}
                  showOutsideDays
                  fixedWeeks
                  endMonth={endMonth}
                  numberOfMonths={1}
                  navLayout="around"
                />

                <MonthSessionsBadge
                  month={displayedMonth}
                  sessions={selectedDays}
                />
              </div>
            </div>
          </SwiperSlide>
        </Swiper>
      </div>
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

export default memo(TeacherProfile);
