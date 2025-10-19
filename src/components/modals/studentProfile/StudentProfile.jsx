import { useCallback, useEffect, useRef, useState } from "react";
import ErrorModal from "@/components/modals/GenericModals/ErrorModal.jsx";
import StudentImage from "@/components/modals/studentProfile/ProfileImage.jsx";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import MediaQuery from "react-responsive";
import { deleteStudent } from "@/services/StudentServices.js";
import SuccessModal from "@/components/modals/GenericModals/SuccessModal.jsx";
import ConfirmModal from "@/components/modals/GenericModals/ConfirmModal.jsx";
import ModifyStudentModal from "@/components/modals/ModifyStudent/ModifyStudentModal.jsx";
import { DayPicker } from "react-day-picker";
import styles from "./StudentProfile.module.css";
import {
  addAttendance,
  deleteAttendance,
  getAttendances,
} from "@/services/AttendanceService.js";
import { fr } from "date-fns/locale";
import { formatDateToYYYYMMDD } from "@/services/utils.js";
import PaymentCalendar from "@/components/PaymentCalendar/PaymentCalendar.jsx";
import { getPaymentStatus } from "@/services/PaymentService.js";
import PaymentForm from "@/components/PaymentForm/PaymentForm.jsx";

import "@fontsource/inter/500";
import "@fontsource/inter/600";
import "@fontsource/inter/700";
import "@fontsource/inter/900";

import {
  enroll,
  get_available_enrollments,
  get_enrollments,
  remove_enrollment,
} from "@/services/FormationServices.js";
import Modal from "react-bootstrap/Modal";

function formatIsoDateToDmy(inputDate) {
  if (!inputDate) return "";
  const parts = inputDate.split("-");
  if (parts.length !== 3) return inputDate;
  const [year, month, day] = parts;
  return `${day}/${month}/${year}`;
}
function useComponentWidth() {
  const ref = useRef(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setWidth(entry.contentRect.width);
      }
    });

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return [ref, width];
}

export default function StudentProfile({ data = {}, handleClose }) {
  const [ref, width] = useComponentWidth();

  const [student, setStudent] = useState(data);
  const [showModify, setShowModify] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showActionConfirm, setShowActionConfirm] = useState(false);
  const [actionConfirmTitle, setActionConfirmTitle] = useState("");
  const [actionConfirmMessage, setActionConfirmMessage] = useState("");
  const [actionConfirmFunc, setActionConfirmFunc] = useState(null);
  const [showPayModal, setShowPayModal] = useState(false);

  // errors & success
  const [showErr, setShowErr] = useState(false);
  const [errCode, setErrCode] = useState(null);
  const [errMsg, setErrMsg] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  // enroll success modal
  const [successOpen, setSuccessOpen] = useState(false);
  const [successTitle, setSuccessTitle] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [isNotFound, setIsNotFound] = useState(false);
  const [dates, setDates] = useState([]);
  const [selectedDays, setSelectedDays] = useState([]);

  // enrollments
  const [enrollments, setEnrollments] = useState([]);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [enrollError, setEnrollError] = useState(null);
  const enrollRequestIdRef = useRef(0);

  // assign modal
  const [showAssignModal, setShowAssignModal] = useState(false);

  // remove enrollment confirm
  const [removeConfirmOpen, setRemoveConfirmOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState(null);
  const [isRemoving, setIsRemoving] = useState(false);

  const currentYear = new Date().getFullYear();
  const endMonth = new Date(currentYear + 1, 11, 31);

  const getAttendanceDates = useCallback(
    async (id) => {
      if (!id) return;
      try {
        const result = await getAttendances(id);
        const datesArr = Array.isArray(result?.dates) ? result.dates : [];
        setDates(datesArr);
        setSelectedDays(datesArr);
      } catch (err) {
        setDates([]);
        setSelectedDays([]);
        setErrCode(500);
        setErrMsg("Impossible de charger les présences.");
        setShowErr(true);
      }
    },
    [setDates, setSelectedDays],
  );

  const [payStatus, setPayStatus] = useState([]);
  async function handleGetPaymentStatus(student_id) {
    try {
      const res = await getPaymentStatus(student_id);
      const records = Array.isArray(res)
        ? res
        : Array.isArray(res.data)
          ? res.data
          : [];
      setPayStatus(records);
    } catch (err) {
      setPayStatus([]);
    }
  }

  // load enrollments with request id guard (prevents race/spam)
  const loadEnrollments = useCallback(async (sid) => {
    if (!sid) {
      setEnrollments([]);
      return;
    }
    const thisReq = ++enrollRequestIdRef.current;
    setEnrollLoading(true);
    setEnrollError(null);
    try {
      const res = await get_enrollments(sid);
      // ignore stale responses
      if (thisReq !== enrollRequestIdRef.current) return;
      let items = [];
      if (Array.isArray(res)) items = res;
      else if (res?.enrollments && Array.isArray(res.enrollments))
        items = res.enrollments;
      else if (res && typeof res === "object") {
        const maybe = Object.values(res).find((v) => Array.isArray(v));
        if (Array.isArray(maybe)) items = maybe;
      }
      setEnrollments(items);
    } catch (err) {
      console.error("get_enrollments error:", err);
      setEnrollError("Impossible de charger les inscriptions.");
      setEnrollments([]);
    } finally {
      // only clear loading if still the latest
      if (thisReq === enrollRequestIdRef.current) setEnrollLoading(false);
    }
  }, []);

  useEffect(() => {
    // when student changes we fetch required resources once
    if (student?.id) {
      getAttendanceDates(student.id);
      handleGetPaymentStatus(student.id);
      loadEnrollments(student.id);
    } else {
      setDates([]);
      setSelectedDays([]);
      setEnrollments([]);
    }
    // only run when student.id changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [student?.id]);

  function showError(code = 500, message = "Une erreur s'est produite") {
    setErrCode(code);
    setErrMsg(message);
    setShowErr(true);
  }

  async function handleAddAttendToday(id) {
    if (!id) return showError(400, "ID étudiant manquant.");
    try {
      const today = new Date().toISOString().split("T")[0];
      const { status } = await addAttendance(id, today);
      if (status !== 201) {
        if (status === 409)
          showError(status, "L'étudiant était déjà présent à cette date.");
        else if (status === 404) showError(status, "L'étudiant n'existe pas.");
        else showError(status);
        return;
      }
      await getAttendanceDates(id);
    } catch (err) {
      showError(500, "Une erreur s'est produite, veuillez réessayer.");
    }
  }

  async function addAttendConfirm(dayYmd) {
    if (!student?.id) return showError(400, "ID étudiant manquant.");
    try {
      const { status } = await addAttendance(student.id, dayYmd);
      if (status !== 201) {
        if (status === 409)
          showError(status, "L'étudiant était déjà présent à cette date.");
        else if (status === 404) showError(status, "L'étudiant n'existe pas.");
        else showError(status);
        setShowActionConfirm(false);
        return;
      }
      await handleGetPaymentStatus(student.id);
      setSelectedDays((prev) => {
        const prevArr = Array.isArray(prev) ? prev : [];
        if (prevArr.includes(dayYmd)) return prevArr;
        return [...prevArr, dayYmd].sort();
      });
      setShowActionConfirm(false);
    } catch (err) {
      setShowActionConfirm(false);
      showError(500, "Une erreur s'est produite, veuillez réessayer.");
    }
  }

  async function deleteAttendConfirm(dayYmd) {
    if (!student?.id) return showError(400, "ID étudiant manquant.");
    try {
      const { status } = await deleteAttendance(student.id, dayYmd);
      if (status !== 200) {
        if (status === 404) showError(status, "L'étudiant n'existe pas.");
        else showError(status);
        setShowActionConfirm(false);
        return;
      }
      setSelectedDays((prev) =>
        Array.isArray(prev) ? prev.filter((d) => d !== dayYmd) : [],
      );
      setShowActionConfirm(false);
    } catch (err) {
      console.error(err);
      setShowActionConfirm(false);
      showError(500, "Une erreur s'est produite, veuillez réessayer.");
    }
  }

  function handleDayPickerSelect(days) {
    if (!days) {
      setSelectedDays([]);
      return;
    }
    const formattedSelected = (selectedDays ?? []).map((d) =>
      formatDateToYYYYMMDD(new Date(d)),
    );
    const formattedDays = (Array.isArray(days) ? days : [days]).map((d) =>
      formatDateToYYYYMMDD(d),
    );

    const added = formattedDays.find((d) => !formattedSelected.includes(d));
    const removed = formattedSelected.find((d) => !formattedDays.includes(d));

    if (added) {
      const formattedAddedHuman = new Intl.DateTimeFormat("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date(added));

      setActionConfirmTitle("Ajouter une présence");
      setActionConfirmMessage(
        `Marquer l'étudiant comme présent le: ${formattedAddedHuman}?`,
      );
      setActionConfirmFunc(() => () => addAttendConfirm(added));
      setShowActionConfirm(true);
    } else if (removed) {
      const formattedRemovedHuman = new Intl.DateTimeFormat("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date(removed));

      setActionConfirmTitle("Supprimer la présence");
      setActionConfirmMessage(
        `Supprimer la présence de: ${formattedRemovedHuman}?`,
      );
      setActionConfirmFunc(() => () => deleteAttendConfirm(removed));
      setShowActionConfirm(true);
    } else {
      setSelectedDays(formattedDays);
    }
  }

  async function handleDeleteStudentConfirmed() {
    if (!student?.id) return showError(400, "ID étudiant manquant.");
    try {
      const status = await deleteStudent(student.id);
      if (status !== 200) {
        if (status === 404) {
          setIsNotFound(true);
          setShowDeleteConfirm(false);
          setShowErr(true);
          return;
        }
        setShowDeleteConfirm(false);
        showError(status, "Erreur lors de la suppression.");
        return;
      }
      setShowDeleteConfirm(false);
      setShowSuccess(true);
    } catch (err) {
      console.error(err);
      setShowDeleteConfirm(false);
      showError(500, "Une erreur s'est produite, veuillez réessayer.");
    }
  }

  function handleModifySuccess(updatedStudent) {
    localStorage.setItem("scanResult", JSON.stringify(updatedStudent));
    setStudent(updatedStudent);
    setShowModify(false);
  }

  function handleCloseSuccess() {
    setShowSuccess(false);
    handleClose?.();
  }

  // --- AssignEnrollModal (shows available enrollments for this student)
  function AssignEnrollModal({ show, onClose, onEnrolled }) {
    const [avail, setAvail] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [enrollingId, setEnrollingId] = useState(null);

    useEffect(() => {
      if (!show) return;
      let cancelled = false;
      (async () => {
        setLoading(true);
        setError(null);
        try {
          const res = await get_available_enrollments(student.id);
          let data = [];
          if (Array.isArray(res)) data = res;
          else if (res?.av_enrollments && Array.isArray(res.av_enrollments))
            data = res.av_enrollments;
          else if (res && typeof res === "object") {
            const maybe = Object.values(res).find((v) => Array.isArray(v));
            if (Array.isArray(maybe)) data = maybe;
          }
          if (!cancelled) setAvail(data);
        } catch (err) {
          console.error("get_available_enrollments error:", err);
          if (!cancelled)
            setError("Impossible de charger les inscriptions disponibles.");
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [show, student.id]);

    async function handleEnroll(item) {
      if (!student?.id || !item?.formation_id) {
        setError("Données manquantes.");
        return;
      }
      setEnrollingId(item.formation_id);
      try {
        const status = await enroll(student.id, item.formation_id);
        if (status >= 200 && status < 300) {
          setSuccessTitle("Inscription effectuée");
          setSuccessMessage("L'étudiant a été inscrit avec succès.");
          setSuccessOpen(true);

          await loadEnrollments(student.id);
          onEnrolled?.();
          onClose?.();
        } else if (status === 422) {
          setErrCode(422);
          setErrMsg("Erreur dans les données saisies.");
          setShowErr(true);
        } else {
          setErrCode(status ?? 500);
          setErrMsg("Une erreur est survenue lors de l'inscription.");
          setShowErr(true);
        }
      } catch (err) {
        console.error("enroll error:", err);
        setErrCode(500);
        setErrMsg("Une erreur est survenue lors de l'inscription.");
        setShowErr(true);
      } finally {
        setEnrollingId(null);
      }
    }

    return (
      <Modal
        show={show}
        onHide={onClose}
        size="m"
        centered
        scrollable
        className={styles.modal}
      >
        <Modal.Header closeButton className={styles.header}>
          <h2 style={{ fontWeight: "bold" }} className={styles.title}>
            Inscrire l'élève
          </h2>
        </Modal.Header>

        <Modal.Body className={styles.body}>
          {error && <div className={styles.error}>{error}</div>}
          {!loading && avail.length === 0 && !error && (
            <div style={{ textAlign: "center" }} className={styles.message}>
              Aucune formation disponible.
            </div>
          )}

          <div className={styles.enrollList}>
            {avail.map((a) => (
              <div key={a.formation_id} className={styles.enrollRow}>
                <div className={styles.enrollInfo}>
                  <div className={styles.enrollLabel}>{a.formation_label}</div>
                  <div className={styles.enrollMeta}>
                    {a.teacher_name ? a.teacher_name : "—"} ·{" "}
                    {a.start_date ? formatIsoDateToDmy(a.start_date) : "—"}
                  </div>
                </div>

                <div className={styles.enrollActions}>
                  <button
                    type="button"
                    className={styles.enrollBtn}
                    onClick={() => handleEnroll(a)}
                    disabled={enrollingId === a.formation_id}
                  >
                    {enrollingId === a.formation_id ? "…" : "Inscrire"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Modal.Body>
      </Modal>
    );
  }

  // remove enrollment
  function handleRemoveClick(enrollment) {
    setRemoveTarget(enrollment);
    setRemoveConfirmOpen(true);
  }

  async function executeRemoveEnrollment() {
    if (!removeTarget || !student?.id) {
      setRemoveConfirmOpen(false);
      return;
    }
    setIsRemoving(true);
    try {
      const status = await remove_enrollment(
        student.id,
        removeTarget.formation_id,
      );
      if (status >= 200 && status < 300) {
        setSuccessTitle("Dissociation effectuée");
        setSuccessMessage("L'inscription a été retirée.");
        setSuccessOpen(true);
        setRemoveConfirmOpen(false);
        await loadEnrollments(student.id);
      } else {
        setErrCode(status ?? 500);
        setErrMsg("Erreur lors de la dissociation.");
        setShowErr(true);
        setRemoveConfirmOpen(false);
      }
    } catch (err) {
      console.error("remove_enrollment error:", err);
      setErrCode(500);
      setErrMsg("Une erreur est survenue lors de la dissociation.");
      setShowErr(true);
      setRemoveConfirmOpen(false);
    } finally {
      setIsRemoving(false);
      setRemoveTarget(null);
    }
  }

  return (
    <>
      <PaymentForm
        id={student.id}
        show={showPayModal}
        onClose={() => setShowPayModal(false)}
        onSave={async () => handleGetPaymentStatus(student.id)}
      />
      <ConfirmModal
        show={showActionConfirm}
        onClose={() => setShowActionConfirm(false)}
        title={actionConfirmTitle}
        message={actionConfirmMessage}
        btn_yes="Confirmer"
        btn_no="Annuler"
        func={actionConfirmFunc}
      />
      <ModifyStudentModal
        show={showModify}
        student={student}
        onClose={() => setShowModify(false)}
        onSuccess={handleModifySuccess}
      />
      <ConfirmModal
        show={showDeleteConfirm}
        title="Confirmer la suppression"
        message="Êtes-vous sûr de vouloir supprimer cet élève ?"
        btn_yes="Supprimer"
        btn_no="Annuler"
        onClose={() => setShowDeleteConfirm(false)}
        func={handleDeleteStudentConfirmed}
      />
      <ErrorModal
        show={showErr}
        onClose={() => setShowErr(false)}
        code={errCode}
        message={errMsg}
      />
      <ErrorModal
        show={isNotFound && !showErr}
        onClose={() => setIsNotFound(false)}
        code={404}
        message="L'étudiant n'a pas été trouvé."
      />
      <SuccessModal
        onClose={handleCloseSuccess}
        title="Succès"
        message="L’étudiant a été supprimé avec succès."
        show={showSuccess}
      />

      <SuccessModal
        show={successOpen}
        title={successTitle}
        message={successMessage}
        onClose={() => setSuccessOpen(false)}
      />

      <ConfirmModal
        show={removeConfirmOpen}
        onClose={() => setRemoveConfirmOpen(false)}
        title="Confirmer la dissociation"
        message={
          removeTarget
            ? `Retirer l'inscription "${removeTarget.formation_label}" ?`
            : "Retirer cette inscription ?"
        }
        btn_yes="Retirer"
        btn_no="Annuler"
        func={executeRemoveEnrollment}
      />

      <div className={styles.container} ref={ref}>
        <div className={styles.header}>
          <div className={styles.imgwrapper}>
            <StudentImage cursor={"pointer"} id={student?.id} shadow={5} />
          </div>
          <h1>{student?.name ?? "—"}</h1>
        </div>

        <div className={styles.swiper}>
          <Swiper
            rewind={false}
            navigation={true}
            modules={[Navigation]}
            className="mySwiper"
          >
            {/* Information slide */}
            <SwiperSlide>
              <div className={styles.content}>
                <h1 className={styles.slideTitle}>Information</h1>
                <table>
                  <tbody>
                    <tr>
                      <td>Date de nais.:</td>
                      <td className={styles.col2}>
                        {formatIsoDateToDmy(student?.birth_date)}
                      </td>
                    </tr>
                    <tr>
                      <td>Tel. 1:</td>
                      <td className={styles.col2}>
                        {student?.tel1 ? (
                          <a href={`tel:${student.tel1}`}>{student.tel1}</a>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td>Tel. 2:</td>
                      <td className={styles.col2}>
                        {student?.tel2 ? (
                          <a href={`tel:${student.tel2}`}>{student.tel2}</a>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td>E-mail:</td>
                      <td className={styles.col2}>
                        {student?.email ? (
                          <a href={`mailto:${student.email}`}>
                            {student.email}
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div className={styles.btnwrapper}>
                  <div className={styles.modbtns}>
                    <button
                      className={styles.swiperbtns}
                      onClick={() => setShowModify(true)}
                    >
                      Modifier
                    </button>
                    <button
                      className={styles.swiperbtns}
                      onClick={() => setShowDeleteConfirm(true)}
                    >
                      Effacer
                    </button>
                  </div>
                  <button
                    className={styles.swiperbtns}
                    onClick={() => {
                      setActionConfirmTitle("Marquer la présence");
                      setActionConfirmMessage(
                        "Etes-vous sûr de vouloir marquer l'élève comme présent aujourd'hui?",
                      );
                      setActionConfirmFunc(
                        () => () => handleAddAttendToday(student?.id),
                      );
                      setShowActionConfirm(true);
                    }}
                  >
                    Marquer présent
                  </button>
                  <button
                    className={styles.swiperbtns}
                    onClick={() => setShowPayModal(true)}
                  >
                    Enregistrer un paiement
                  </button>
                </div>
              </div>
            </SwiperSlide>

            {/* Présences slide */}
            <SwiperSlide>
              <div className={styles.content}>
                <h1 className={styles.slideTitle}>Présences</h1>
                <MediaQuery minWidth={760}>
                  <DayPicker
                    locale={fr}
                    captionLayout="dropdown"
                    animate
                    mode="multiple"
                    selected={(selectedDays ?? []).map((d) => new Date(d))}
                    onSelect={handleDayPickerSelect}
                    showOutsideDays
                    fixedWeeks
                    endMonth={endMonth}
                    numberOfMonths={Math.round(width / 480)}
                    pagedNavigation
                    navLayout="around"
                  />
                </MediaQuery>
                <MediaQuery maxWidth={759.5}>
                  <DayPicker
                    locale={fr}
                    captionLayout="dropdown"
                    animate
                    mode="multiple"
                    selected={(selectedDays ?? []).map((d) => new Date(d))}
                    onSelect={handleDayPickerSelect}
                    showOutsideDays
                    fixedWeeks
                    endMonth={endMonth}
                    navLayout="around"
                  />
                </MediaQuery>
              </div>
            </SwiperSlide>

            {/* FORMATIONS (penultimate) */}
            <SwiperSlide>
              <div className={styles.content}>
                <h1 className={styles.slideTitle}>Formations</h1>

                {/* wide + card */}
                <div
                  className={styles.addEnrollmentCard}
                  role="button"
                  tabIndex={0}
                  onClick={() => setShowAssignModal(true)}
                >
                  <div className={styles.addCardInner}>
                    <div className={styles.plusSign}>+</div>
                    <div>
                      <div style={{ fontWeight: 700 }}>
                        Assigner une formation
                      </div>
                      <div className={styles.enrollMeta}>
                        Choisir parmi les formations disponibles
                      </div>
                    </div>
                  </div>
                </div>

                {enrollError && (
                  <div className={styles.error}>{enrollError}</div>
                )}

                {/* <-- scrollable container that doesn't grow the parent --> */}
                <div className={styles.enrollmentsScroll}>
                  {enrollLoading && (
                    <div className={styles.message}>Chargement…</div>
                  )}
                  {!enrollLoading &&
                    enrollments.length === 0 &&
                    !enrollError && (
                      <div className={styles.empty}>
                        Aucune formation trouvée.
                      </div>
                    )}

                  <div className={styles.enrollmentsWrap}>
                    {enrollments.map((e) => (
                      <div
                        key={
                          String(e.formation_id) + "-" + (e.start_date ?? "")
                        }
                        className={styles.enrollRow}
                      >
                        <div className={styles.enrollInfo}>
                          <div className={styles.enrollLabel}>
                            {e.formation_label}
                          </div>
                          <div className={styles.enrollMeta}>
                            Enseignant: {e.teacher_name ? e.teacher_name : "—"}{" "}
                            · Début:{" "}
                            {e.start_date
                              ? formatIsoDateToDmy(e.start_date)
                              : "—"}
                          </div>
                        </div>

                        <div className={styles.enrollActions}>
                          <button
                            type="button"
                            className={styles.removeEnrollBtn}
                            onClick={() => handleRemoveClick(e)}
                            aria-label="Retirer l'inscription"
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
                    ))}
                  </div>
                </div>
              </div>
            </SwiperSlide>

            {/* Payments slide (last) */}
            <SwiperSlide>
              <div className={styles.content}>
                <h1 className={styles.slideTitle}>Paiements</h1>
                <div>
                  <PaymentCalendar
                    id={student.id}
                    records={payStatus}
                    onPayEdit={() => handleGetPaymentStatus(student.id)}
                  />
                </div>
              </div>
            </SwiperSlide>
          </Swiper>
        </div>
      </div>

      {/* Assign enroll modal at root level */}
      <AssignEnrollModal
        show={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        onEnrolled={() => loadEnrollments(student.id)}
      />
    </>
  );
}
