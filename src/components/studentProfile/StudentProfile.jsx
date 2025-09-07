import { useEffect, useState } from "react";
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

function formatIsoDateToDmy(inputDate) {
  if (!inputDate) return "";
  const parts = inputDate.split("-");
  if (parts.length !== 3) return inputDate;
  const [year, month, day] = parts;
  return `${day}/${month}/${year}`;
}

export default function StudentProfile({ data, handleClose }) {
  const [isNotFound, setIsNotFound] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showModify, setShowModify] = useState(false);

  const [student, setStudent] = useState(data);

  const [dates, setDates] = useState([]);
  const [selectedDays, setSelectedDays] = useState([]);

  const currentYear = new Date().getFullYear();
  const endMonth = new Date(currentYear + 1, 11, 31);

  useEffect(() => {
    getAttendanceDates(student.id);
  }, []);

  async function getAttendanceDates() {
    const result = await getAttendances(student.id);
    setDates(result.dates);
    setSelectedDays(result.dates);
  }
  async function handleAddAttend(id) {
    await addAttendance(id, new Date().toISOString().split("T")[0]);
    await getAttendanceDates();
  }

  function handleModifySuccess(updatedStudent) {
    localStorage.setItem("scanResult", JSON.stringify(updatedStudent));
    setStudent(updatedStudent);
  }

  function handleCloseSuccess() {
    setShowSuccess(false);
    handleClose();
  }

  async function addAttendConfirm(day) {
    try {
      const { status, data } = await addAttendance(student.id, day);
      if (status !== 201) {
        setShowConfirm(false);
      } else {
        setSelectedDays([...selectedDays, day]);
      }
    } catch {
      setShowConfirm(false);
    }
  }

  async function deleteAttendConfirm(day) {
    try {
      const { status, data } = await deleteAttendance(student.id, day);
      if (status !== 200) {
        setShowConfirm(false);
      } else {
        setSelectedDays(selectedDays.filter((d) => d !== day));
      }
    } catch {
      setShowConfirm(false);
    }
  }

  async function handleDeleteStudent(id) {
    try {
      const status = await deleteStudent(id);

      if (status !== 200) {
        if (status === 404) {
          setIsNotFound(true);
        }
        setShowError(true);
      } else {
        setShowSuccess(true);
      }
    } catch {
      setIsNotFound(false);
      setShowError(true);
    }
  }
  const [showOpt, setShowOpt] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmFunc, setConfirmFunc] = useState(null);
  return (
    <>
      <ConfirmModal
        show={showOpt}
        onClose={() => setShowOpt(false)}
        title={confirmTitle}
        message={confirmMessage}
        btn_yes="Confirmer"
        btn_no="Annuler"
        func={confirmFunc}
      ></ConfirmModal>
      <ModifyStudentModal
        show={showModify}
        student={data}
        onClose={() => setShowModify(false)}
        onSuccess={handleModifySuccess}
      ></ModifyStudentModal>

      <ConfirmModal
        show={showConfirm}
        title="Confirmer la suppression"
        message="Êtes-vous sûr de vouloir supprimer cet élève ?"
        btn_yes="Supprimer"
        btn_no="Annuler"
        onClose={() => setShowConfirm(false)}
        func={() => handleDeleteStudent(student.id)}
      ></ConfirmModal>

      <ErrorModal
        show={showError}
        {...(isNotFound
          ? { code: 404, message: "L'étudiant n'a pas été trouvé." }
          : {})}
        onClose={() => setShowError(false)}
      />

      <SuccessModal
        onClose={handleCloseSuccess}
        title="Succès"
        message="L’étudiant a été supprimé avec succès."
        show={showSuccess}
      ></SuccessModal>

      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.imgwrapper}>
            <StudentImage cursor={"pointer"} id={student.id} shadow={5} />
          </div>
          <h1>{student.name}</h1>
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
                        {formatIsoDateToDmy(student.birth_date)}
                      </td>
                    </tr>
                    <tr>
                      <td>Tel. 1:</td>
                      <td className={styles.col2}>
                        <a href={`tel:${student.tel1}`}>{student.tel1}</a>
                      </td>
                    </tr>
                    <tr>
                      <td>Tel. 2:</td>
                      <td className={styles.col2}>
                        <a href={`tel:${student.tel2}`}>{student.tel2}</a>
                      </td>
                    </tr>
                    <tr>
                      <td>E-mail:</td>
                      <td className={styles.col2}>
                        <a href={`mailto:${student.email}`}>{student.email}</a>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div className={styles.btnwrapper}>
                  <div className={styles.modbtns}>
                    <button onClick={() => setShowModify(true)}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="1em"
                        height="1em"
                        viewBox="0 0 1025 1023"
                      >
                        <path
                          fill="currentColor"
                          d="M896.428 1023h-768q-53 0-90.5-37.5T.428 895V127q0-53 37.5-90t90.5-37h576l-128 127h-384q-27 0-45.5 19t-18.5 45v640q0 27 19 45.5t45 18.5h640q27 0 45.5-18.5t18.5-45.5V447l128-128v576q0 53-37.5 90.5t-90.5 37.5zm-576-464l144 144l-208 64zm208 96l-160-159l479-480q17-16 40.5-16t40.5 16l79 80q16 16 16.5 39.5t-16.5 40.5z"
                        />
                      </svg>
                      Modifier
                    </button>
                    <button onClick={() => setShowConfirm(true)}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="1em"
                        height="1em"
                        viewBox="0 0 26 26"
                      >
                        <path
                          fill="currentColor"
                          d="M11.5-.031c-1.958 0-3.531 1.627-3.531 3.594V4H4c-.551 0-1 .449-1 1v1H2v2h2v15c0 1.645 1.355 3 3 3h12c1.645 0 3-1.355 3-3V8h2V6h-1V5c0-.551-.449-1-1-1h-3.969v-.438c0-1.966-1.573-3.593-3.531-3.593h-3zm0 2.062h3c.804 0 1.469.656 1.469 1.531V4H10.03v-.438c0-.875.665-1.53 1.469-1.53zM6 8h5.125c.124.013.247.031.375.031h3c.128 0 .25-.018.375-.031H20v15c0 .563-.437 1-1 1H7c-.563 0-1-.437-1-1V8zm2 2v12h2V10H8zm4 0v12h2V10h-2zm4 0v12h2V10h-2z"
                        />
                      </svg>
                      Effacer
                    </button>
                  </div>
                  <button onClick={() => handleAddAttend(student.id)}>
                    Marquer présent
                  </button>
                  <button>Enregistrer le paiement</button>
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
                    selected={selectedDays.map((d) => new Date(d))}
                    onSelect={(days) => {
                      if (!days) {
                        setSelectedDays([]);
                        return;
                      }

                      const formattedSelected = selectedDays.map((d) =>
                        formatDateToYYYYMMDD(new Date(d)),
                      );
                      const formattedDays = days.map((d) =>
                        formatDateToYYYYMMDD(d),
                      );

                      const added = formattedDays.find(
                        (d) => !formattedSelected.includes(d),
                      );
                      const removed = formattedSelected.find(
                        (d) => !formattedDays.includes(d),
                      );

                      if (added) {
                        const formattedAdded = new Intl.DateTimeFormat(
                          "fr-FR",
                          {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          },
                        ).format(new Date(added));

                        setShowOpt(true);
                        setConfirmTitle("Ajouter une présence");
                        setConfirmMessage(
                          `Marquer l'étudiant comme présent le: ${formattedAdded}?`,
                        );
                        setConfirmFunc(() => () => addAttendConfirm(added));
                      } else if (removed) {
                        const formattedRemoved = new Intl.DateTimeFormat(
                          "fr-FR",
                          {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          },
                        ).format(new Date(removed));

                        setShowOpt(true);
                        setConfirmTitle("Supprimer la présence");
                        setConfirmMessage(
                          `Supprimer la présence de: ${formattedRemoved}?`,
                        );
                        setConfirmFunc(() => () => {
                          deleteAttendConfirm(removed);
                        });
                      }
                    }}
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
                    captionLayout={"dropdown"}
                    animate
                    selected={selectedDays.map((d) => new Date(d))}
                    onSelect={(days) => {
                      if (!days) {
                        setSelectedDays([]);
                        return;
                      }

                      const formattedSelected = selectedDays.map((d) =>
                        formatDateToYYYYMMDD(new Date(d)),
                      );
                      const formattedDays = days.map((d) =>
                        formatDateToYYYYMMDD(d),
                      );

                      const added = formattedDays.find(
                        (d) => !formattedSelected.includes(d),
                      );
                      const removed = formattedSelected.find(
                        (d) => !formattedDays.includes(d),
                      );

                      if (added) {
                        const formattedAdded = new Intl.DateTimeFormat(
                          "fr-FR",
                          {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          },
                        ).format(new Date(added));

                        setShowOpt(true);
                        setConfirmTitle("Ajouter une présence");
                        setConfirmMessage(
                          `Marquer l'étudiant comme présent le: ${formattedAdded}?`,
                        );
                        setConfirmFunc(() => () => addAttendConfirm(added));
                      } else if (removed) {
                        const formattedRemoved = new Intl.DateTimeFormat(
                          "fr-FR",
                          {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          },
                        ).format(new Date(removed));

                        setShowOpt(true);
                        setConfirmTitle("Supprimer la présence");
                        setConfirmMessage(
                          `Supprimer la présence de: ${formattedRemoved}?`,
                        );
                        setConfirmFunc(() => () => {
                          deleteAttendConfirm(removed);
                        });
                      }
                    }}
                    mode="multiple"
                    showOutsideDays
                    fixedWeeks
                    endMonth={endMonth}
                    navLayout={"around"}
                  />
                </MediaQuery>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className={styles.content}>
                <h1>Paiements</h1>
              </div>
            </SwiperSlide>
          </Swiper>
        </div>

        {/*<MediaQuery minWidth={800}>*/}
        {/*  <div className={styles.deskContent}>*/}
        {/*    <div className={styles.contentWrapper}>*/}
        {/*      <div className={styles.info}>*/}
        {/*        <h1>Information</h1>*/}
        {/*        <table>*/}
        {/*          <tbody>*/}
        {/*            <tr>*/}
        {/*              <td>Date de nais.:</td>*/}
        {/*              <td className={styles.col2}>*/}
        {/*                {formatIsoDateToDmy(student.birth_date)}*/}
        {/*              </td>*/}
        {/*            </tr>*/}
        {/*            <tr>*/}
        {/*              <td>Tel. 1:</td>*/}
        {/*              <td className={styles.col2}>*/}
        {/*                <a>{student.tel1}</a>*/}
        {/*              </td>*/}
        {/*            </tr>*/}
        {/*            <tr>*/}
        {/*              <td>Tel. 2:</td>*/}
        {/*              <td className={styles.col2}>*/}
        {/*                <a>{student.tel2}</a>*/}
        {/*              </td>*/}
        {/*            </tr>*/}
        {/*            <tr>*/}
        {/*              <td>E-mail:</td>*/}
        {/*              <td className={styles.col2}>*/}
        {/*                <a href={`mailto:${student.email}`}>{student.email}</a>*/}
        {/*              </td>*/}
        {/*            </tr>*/}
        {/*          </tbody>*/}
        {/*        </table>*/}
        {/*      </div>*/}
        {/*      <div className={styles.buttons}>*/}
        {/*        <div className={styles.btn} onClick={() => setShowModify(true)}>*/}
        {/*          <svg*/}
        {/*            xmlns="http://www.w3.org/2000/svg"*/}
        {/*            width="1em"*/}
        {/*            height="1em"*/}
        {/*            viewBox="0 0 1025 1023"*/}
        {/*          >*/}
        {/*            <path*/}
        {/*              fill="currentColor"*/}
        {/*              d="M896.428 1023h-768q-53 0-90.5-37.5T.428 895V127q0-53 37.5-90t90.5-37h576l-128 127h-384q-27 0-45.5 19t-18.5 45v640q0 27 19 45.5t45 18.5h640q27 0 45.5-18.5t18.5-45.5V447l128-128v576q0 53-37.5 90.5t-90.5 37.5zm-576-464l144 144l-208 64zm208 96l-160-159l479-480q17-16 40.5-16t40.5 16l79 80q16 16 16.5 39.5t-16.5 40.5z"*/}
        {/*            />*/}
        {/*          </svg>*/}
        {/*          Modifier*/}
        {/*        </div>*/}
        {/*        <div*/}
        {/*          className={styles.btn}*/}
        {/*          onClick={() => setShowConfirm(true)}*/}
        {/*        >*/}
        {/*          <svg*/}
        {/*            xmlns="http://www.w3.org/2000/svg"*/}
        {/*            width="1em"*/}
        {/*            height="1em"*/}
        {/*            viewBox="0 0 26 26"*/}
        {/*          >*/}
        {/*            <path*/}
        {/*              fill="currentColor"*/}
        {/*              d="M11.5-.031c-1.958 0-3.531 1.627-3.531 3.594V4H4c-.551 0-1 .449-1 1v1H2v2h2v15c0 1.645 1.355 3 3 3h12c1.645 0 3-1.355 3-3V8h2V6h-1V5c0-.551-.449-1-1-1h-3.969v-.438c0-1.966-1.573-3.593-3.531-3.593h-3zm0 2.062h3c.804 0 1.469.656 1.469 1.531V4H10.03v-.438c0-.875.665-1.53 1.469-1.53zM6 8h5.125c.124.013.247.031.375.031h3c.128 0 .25-.018.375-.031H20v15c0 .563-.437 1-1 1H7c-.563 0-1-.437-1-1V8zm2 2v12h2V10H8zm4 0v12h2V10h-2zm4 0v12h2V10h-2z"*/}
        {/*            />*/}
        {/*          </svg>*/}
        {/*          Effacer*/}
        {/*        </div>*/}
        {/*      </div>*/}
        {/*    </div>*/}
        {/*    <div className={styles.content}>*/}
        {/*      <h1>Présences</h1>*/}
        {/*      <DayPicker*/}
        {/*        locale={fr}*/}
        {/*        captionLayout={"dropdown"}*/}
        {/*        animate*/}
        {/*        selected={dates}*/}
        {/*        onSelect={() => {}}*/}
        {/*        mode="multiple"*/}
        {/*        showOutsideDays*/}
        {/*        fixedWeeks*/}
        {/*        endMonth={endMonth}*/}
        {/*        navLayout={"around"}*/}
        {/*      />*/}
        {/*    </div>*/}
        {/*  </div>*/}
        {/*</MediaQuery>*/}
      </div>
    </>
  );
}
