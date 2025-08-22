import styles from "./Etudiants.module.css";
import { getAllStudents } from "@/services/StudentServices.js";
import { useEffect, useMemo, useState } from "react";

function Etudiants() {
  const PAGE_SIZE = 12;
  const [etudiants, setEtudiants] = useState([]);
  const [page, setPage] = useState(1); // 1-based page number

  async function fetchStudents() {
    const { status, students } = await getAllStudents();
    setEtudiants(students ?? []);
  }

  useEffect(() => {
    fetchStudents();
  }, []);

  const totalPages = Math.max(1, Math.ceil(etudiants.length / PAGE_SIZE));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [etudiants.length, totalPages, page]);

  const pageData = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return etudiants.slice(start, start + PAGE_SIZE);
  }, [etudiants, page]);

  const goToPage = (p) => {
    const next = Math.min(Math.max(1, p), totalPages);
    setPage(next);
  };

  function renderPageButtons() {
    const maxButtons = 8;
    if (totalPages <= maxButtons) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = [];
    const left = Math.max(1, page - 2);
    const right = Math.min(totalPages, page + 2);

    if (left > 1) {
      pages.push(1);
      if (left > 2) pages.push("left-ellipsis");
    }

    for (let p = left; p <= right; p++) pages.push(p);

    if (right < totalPages) {
      if (right < totalPages - 1) pages.push("right-ellipsis");
      pages.push(totalPages);
    }

    return pages;
  }

  return (
    <>
      <div className={styles.page}>
        <h1>Etudiants</h1>
        <div className={styles.content}>
          <table className={styles.table}>
            <tbody>
              {pageData.length === 0 ? (
                // ERROR MESSAGE NONE FOUND
                <tr>
                  <td colSpan={4}>Aucun étudiant trouvé.</td>
                </tr>
              ) : (
                pageData.map((user) => (
                  <tr key={user.id}>
                    <td className={styles.namecol}>{user.name}</td>
                    <td>
                      <button className={styles.qrbtn}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="1.4rem"
                          height="1.4rem"
                          viewBox="0 0 32 32"
                        >
                          <path
                            fill="currentColor"
                            d="M24 28v-2h2v2zm-6-4v-2h2v2zm0 6h4v-2h-2v-2h-2v4zm8-4v-4h2v4zm2 0h2v4h-4v-2h2v-2zm-2-6v-2h4v4h-2v-2h-2zm-2 0h-2v4h-2v2h4v-6zm-6 0v-2h4v2zM6 22h4v4H6z"
                          />
                          <path
                            fill="currentColor"
                            d="M14 30H2V18h12zM4 28h8v-8H4zM22 6h4v4h-4z"
                          />
                          <path
                            fill="currentColor"
                            d="M30 14H18V2h12zm-10-2h8V4h-8zM6 6h4v4H6z"
                          />
                          <path
                            fill="currentColor"
                            d="M14 14H2V2h12ZM4 12h8V4H4Z"
                          />
                        </svg>
                      </button>
                    </td>
                    <td>
                      <button className={styles.editbtn}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="1.15rem"
                          height="1.15rem"
                          viewBox="0 0 384 384"
                        >
                          <path
                            fill="currentColor"
                            d="M0 304L236 68l80 80L80 384H0v-80zM378 86l-39 39l-80-80l39-39q6-6 15-6t15 6l50 50q6 6 6 15t-6 15z"
                          />
                        </svg>
                      </button>
                    </td>
                    <td>
                      <button className={styles.delbtn}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="1.1em"
                          height="1.1em"
                          viewBox="0 0 26 26"
                        >
                          <path
                            fill="currentColor"
                            d="M11.5-.031c-1.958 0-3.531 1.627-3.531 3.594V4H4c-.551 0-1 .449-1 1v1H2v2h2v15c0 1.645 1.355 3 3 3h12c1.645 0 3-1.355 3-3V8h2V6h-1V5c0-.551-.449-1-1-1h-3.969v-.438c0-1.966-1.573-3.593-3.531-3.593h-3zm0 2.062h3c.804 0 1.469.656 1.469 1.531V4H10.03v-.438c0-.875.665-1.53 1.469-1.53zM6 8h5.125c.124.013.247.031.375.031h3c.128 0 .25-.018.375-.031H20v15c0 .563-.437 1-1 1H7c-.563 0-1-.437-1-1V8zm2 2v12h2V10H8zm4 0v12h2V10h-2zm4 0v12h2V10h-2z"
                          />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className={styles.controlbtns}>
            <nav>
              <button onClick={() => goToPage(page - 1)} disabled={page === 1}>
                &lt;
              </button>

              {renderPageButtons().map((p, idx) => {
                if (p === "left-ellipsis" || p === "right-ellipsis") {
                  return <span key={p + idx}>…</span>;
                }
                return (
                  <button
                    key={p}
                    onClick={() => goToPage(p)}
                    className={p === page ? styles.activePage : ""}
                  >
                    {p}
                  </button>
                );
              })}

              <button
                onClick={() => goToPage(page + 1)}
                disabled={page === totalPages}
              >
                &gt;
              </button>
            </nav>
          </div>
        </div>
      </div>
    </>
  );
}

export default Etudiants;
