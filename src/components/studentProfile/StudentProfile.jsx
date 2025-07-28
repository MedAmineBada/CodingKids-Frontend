import StudentImage from "@/components/studentProfile/ProfileImage.jsx";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import MediaQuery from "react-responsive";
import styles from "./StudentProfile.module.css";

function StudentProfile({ data }) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.imgwrapper}>
          <StudentImage id={data["id"]} shadow={10}></StudentImage>
        </div>
        <h1>{data["name"]}</h1>
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
              <p>Informations</p>
            </SwiperSlide>
            <SwiperSlide>
              <p>Présences</p>
            </SwiperSlide>
            <SwiperSlide>
              <p>Paiements</p>
            </SwiperSlide>
            <SwiperSlide>
              <p>Envoyer un e-mail</p>
            </SwiperSlide>
          </Swiper>
        </div>
      </MediaQuery>
    </div>
  );
}

export default StudentProfile;
