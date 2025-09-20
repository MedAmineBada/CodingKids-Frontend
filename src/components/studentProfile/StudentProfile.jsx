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
import PaymentForm from "@/components/PaymentForm/PaymentForm.jsx";

function formatIsoDateToDmy(inputDate) {
  if (!inputDate) return "";
  const parts = inputDate.split("-");
  if (parts.length !== 3) return inputDate;
  const [year, month, day] = parts;
  return `${day}/${month}/${year}`;
}

export default function StudentProfile({ data = {}, handleClose }) {
  const [student, setStudent] = useState(data);
  const [showModify, setShowModify] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showActionConfirm, setShowActionConfirm] = useState(false);
  const [actionConfirmTitle, setActionConfirmTitle] = useState("");
  const [actionConfirmMessage, setActionConfirmMessage] = useState("");
  const [actionConfirmFunc, setActionConfirmFunc] = useState(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const [showPayInfoModal, setShowPayInfoModal] = useState(false);
  const [showErr, setShowErr] = useState(false);
  const [errCode, setErrCode] = useState(null);
  const [errMsg, setErrMsg] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [isNotFound, setIsNotFound] = useState(false);
  const [dates, setDates] = useState([]);
  const [selectedDays, setSelectedDays] = useState([]);

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

  useEffect(() => {
    if (student?.id) {
      getAttendanceDates(student.id);
      handleGetPaymentStatus(student.id);
    }
  }, [student?.id, getAttendanceDates]);

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
                    onClick={() => {
                      setShowPayModal(true);
                    }}
                  >
                    Enregistrer un paiement
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
                  <PaymentCalendar
                    id={student.id}
                    records={payStatus}
                    onPayEdit={() => handleGetPaymentStatus(student.id)}
                  ></PaymentCalendar>
                </div>
              </div>
            </SwiperSlide>
          </Swiper>
        </div>
      </div>
    </>
  );
}
