import styles from "./Dashboard.module.css";

import "@fontsource/inter/700";
import "@fontsource/inter/900";

import "@fontsource/quicksand/500.css";

function Dashboard() {
  return (
    <>
      <div className={styles.title}>
        <h1>Dashboard</h1>
      </div>
      <div className={styles.content}></div>
    </>
  );
}

export default Dashboard;
