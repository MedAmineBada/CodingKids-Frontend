// StudentProfile.jsx
import { useCallback, useEffect, useState } from "react";
import ErrorModal from "@/components/modals/ErrorModal.jsx";
import StudentImage from "@/components/studentProfile/ProfileImage.jsx";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import MediaQuery from "react-responsive";
import { deleteStudent } from "@/services/StudentServices";
import SuccessModal from "@/components/modals/SuccessModal.jsx";
import ConfirmModal from "@/components/modals/ConfirmModal.jsx";
import ModifyStudentModal from "@/components/modals/ModifyStudentModal.jsx";
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

/* Helper to display YYYY-MM-DD -> DD/MM/YYYY */
function formatIsoDateToDmy(inputDate) {
  if (!inputDate) return "";
  const parts = inputDate.split("-");
  if (parts.length !== 3) return inputDate;
  const [year, month, day] = parts;
  return `${day}/${month}/${year}`;
}

export default function StudentProfile({ data = {}, handleClose }) {
  // Student
  const [student, setStudent] = useState(data);

  // UI modals
  const [showModify, setShowModify] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showActionConfirm, setShowActionConfirm] = useState(false); // generic confirm for actions (attendance add/remove / mark present)
  const [actionConfirmTitle, setActionConfirmTitle] = useState("");
  const [actionConfirmMessage, setActionConfirmMessage] = useState("");
  const [actionConfirmFunc, setActionConfirmFunc] = useState(null);

  const [showErr, setShowErr] = useState(false);
  const [errCode, setErrCode] = useState(null);
  const [errMsg, setErrMsg] = useState("");

  const [showSuccess, setShowSuccess] = useState(false);
  const [isNotFound, setIsNotFound] = useState(false);

  // Attendance state
  const [dates, setDates] = useState([]); // raw string dates from API (YYYY-MM-DD)
  const [selectedDays, setSelectedDays] = useState([]); // normalized to array of YYYY-MM-DD strings

  // calendar limits
  const currentYear = new Date().getFullYear();
  const endMonth = new Date(currentYear + 1, 11, 31);

  // Fetch attendances for a student id; normalize result.dates -> []
  const getAttendanceDates = useCallback(
    async (id) => {
      if (!id) return;
      try {
        const result = await getAttendances(id);
        // Some backends return null instead of [], so normalize
        const datesArr = Array.isArray(result?.dates) ? result.dates : [];
        setDates(datesArr);
        setSelectedDays(datesArr);
      } catch (err) {
        console.error("getAttendances failed:", err);
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
  // run on mount and when student.id changes
  useEffect(() => {
    if (student?.id) {
      getAttendanceDates(student.id);
      handleGetPaymentStatus(student.id);
    }
  }, [student?.id, getAttendanceDates]);

  // Generic safe helper to show error
  function showError(code = 500, message = "Une erreur s'est produite") {
    setErrCode(code);
    setErrMsg(message);
    setShowErr(true);
  }

  // Add attendance for today (used by "Marquer présent" button)
  async function handleAddAttendToday(id) {
    if (!id) return showError(400, "ID étudiant manquant.");
    try {
      const today = new Date().toISOString().split("T")[0];
      const { status } = await addAttendance(id, today);
      if (status !== 201) {
        // handle known API responses
        if (status === 409)
          showError(status, "L'étudiant était déjà présent à cette date.");
        else if (status === 404) showError(status, "L'étudiant n'existe pas.");
        else showError(status);
        return;
      }
      // success -> refresh data and local state
      await getAttendanceDates(id);
    } catch (err) {
      console.error(err);
      showError(500, "Une erreur s'est produite, veuillez réessayer.");
    }
  }

  // Called when user confirms adding a specific day
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
      // update selectedDays safely
      setSelectedDays((prev) => {
        const prevArr = Array.isArray(prev) ? prev : [];
        if (prevArr.includes(dayYmd)) return prevArr;
        return [...prevArr, dayYmd].sort(); // keep sorted optional
      });
      setShowActionConfirm(false);
    } catch (err) {
      console.error(err);
      setShowActionConfirm(false);
      showError(500, "Une erreur s'est produite, veuillez réessayer.");
    }
  }

  // Called when user confirms removing a specific day
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

  // Unified DayPicker selection handler (works for both desktop/mobile variants)
  function handleDayPickerSelect(days) {
    // days can be undefined/null (cleared) or an array of Dates when mode="multiple"
    if (!days) {
      setSelectedDays([]);
      return;
    }
    // convert current selectedDays (strings) to formatted for comparison
    const formattedSelected = (selectedDays ?? []).map((d) =>
      formatDateToYYYYMMDD(new Date(d)),
    );
    const formattedDays = (Array.isArray(days) ? days : [days]).map((d) =>
      formatDateToYYYYMMDD(d),
    );

    const added = formattedDays.find((d) => !formattedSelected.includes(d));
    const removed = formattedSelected.find((d) => !formattedDays.includes(d));

    if (added) {
      // show confirmation modal for add
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
      // No single add/remove detected (maybe multiple changes). For safety, just sync local selectedDays
      setSelectedDays(formattedDays);
    }
  }

  // Delete student handler (for delete confirm)
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

  // Called after successful modification (from ModifyStudentModal)
  function handleModifySuccess(updatedStudent) {
    localStorage.setItem("scanResult", JSON.stringify(updatedStudent));
    setStudent(updatedStudent);
    setShowModify(false);
  }

  // handle success modal close -> close parent
  function handleCloseSuccess() {
    setShowSuccess(false);
    handleClose?.();
  }

  return (
    <>
      {/* Generic action confirm modal (attendance add/remove, mark present confirmation) */}
      <ConfirmModal
        show={showActionConfirm}
        onClose={() => setShowActionConfirm(false)}
        title={actionConfirmTitle}
        message={actionConfirmMessage}
        btn_yes="Confirmer"
        btn_no="Annuler"
        func={actionConfirmFunc}
      />

      {/* Modify student modal */}
      <ModifyStudentModal
        show={showModify}
        student={student}
        onClose={() => setShowModify(false)}
        onSuccess={handleModifySuccess}
      />

      {/* Delete student confirm modal */}
      <ConfirmModal
        show={showDeleteConfirm}
        title="Confirmer la suppression"
        message="Êtes-vous sûr de vouloir supprimer cet élève ?"
        btn_yes="Supprimer"
        btn_no="Annuler"
        onClose={() => setShowDeleteConfirm(false)}
        func={handleDeleteStudentConfirmed}
      />

      {/* Error modals */}
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

      {/* Success modal for deletion */}
      <SuccessModal
        onClose={handleCloseSuccess}
        title="Succès"
        message="L’étudiant a été supprimé avec succès."
        show={showSuccess}
      />

      <div className={styles.container}>
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
            <SwiperSlide>
              <div className={styles.content}>
                <h1>Information</h1>
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
                      // confirm mark present for today before calling API
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

                  <button className={styles.swiperbtns}>
                    Enregistrer le paiement
                  </button>
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className={styles.content}>
                <h1>Présences</h1>

                <MediaQuery minWidth={800}>
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
                    numberOfMonths={2}
                    pagedNavigation
                    navLayout="around"
                  />
                </MediaQuery>

                <MediaQuery maxWidth={799.5}>
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

            <SwiperSlide>
              <div className={styles.content}>
                <h1>Paiements</h1>
                <div>
                  <PaymentCalendar records={payStatus}></PaymentCalendar>
                </div>
              </div>
            </SwiperSlide>
          </Swiper>
        </div>
      </div>
    </>
  );
}
