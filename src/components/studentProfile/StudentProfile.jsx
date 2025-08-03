import { useState } from "react";
import ErrorModal from "@/components/modals/ErrorModal.jsx";
import StudentImage from "@/components/studentProfile/ProfileImage.jsx";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import MediaQuery from "react-responsive";
import styles from "./StudentProfile.module.css";
import { deleteStudent } from "@/services/StudentServices";
import SuccessModal from "@/components/modals/SuccessModal.jsx";

function formatIsoDateToDmy(inputDate) {
  if (!inputDate) return "";
  const parts = inputDate.split("-");
  if (parts.length !== 3) return inputDate;
  const [year, month, day] = parts;
  return `${day}/${month}/${year}`;
}

export default function StudentProfile({ data, handleClose }) {
  const [showError, setShowError] = useState(false);
  const [isNotFound, setIsNotFound] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  function handleCloseSuccess() {
    setShowSuccess(false);
    handleClose();
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

  return (
    <>
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
            <StudentImage id={data.id} shadow={10} />
          </div>
          <h1>{data.name}</h1>
        </div>

        <MediaQuery maxWidth={800}>
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
                          {formatIsoDateToDmy(data.birth_date)}
                        </td>
                      </tr>
                      <tr>
                        <td>Tel. 1:</td>
                        <td className={styles.col2}>
                          <a href={`tel:${data.tel1}`}>{data.tel1}</a>
                        </td>
                      </tr>
                      <tr>
                        <td>Tel. 2:</td>
                        <td className={styles.col2}>
                          <a href={`tel:${data.tel2}`}>{data.tel2}</a>
                        </td>
                      </tr>
                      <tr>
                        <td>E-mail:</td>
                        <td className={styles.col2}>
                          <a href={`mailto:${data.email}`}>{data.email}</a>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <div className={styles.btnwrapper}>
                    <div className={styles.modbtns}>
                      <button>Modifier</button>
                      <button onClick={() => handleDeleteStudent(data.id)}>
                        Effacer
                      </button>
                    </div>
                    <button>Marquer présent</button>
                    <button>Enregistrer le paiement</button>
                  </div>
                </div>
              </SwiperSlide>

              <SwiperSlide>
                <div className={styles.content}>
                  <h1>Présences</h1>
                </div>
              </SwiperSlide>

              <SwiperSlide>
                <div className={styles.content}>
                  <h1>Paiements</h1>
                </div>
              </SwiperSlide>
            </Swiper>
          </div>
        </MediaQuery>
      </div>
    </>
  );
}
