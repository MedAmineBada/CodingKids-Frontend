import styles from "./Etudiants.module.css";
import { deleteStudent, getAllStudents } from "@/services/StudentServices.js";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Dropdown, Form, InputGroup, Spinner } from "react-bootstrap";
import ConfirmModal from "@/components/modals/GenericModals/ConfirmModal.jsx";
import ModifyStudentModal from "@/components/modals/ModifyStudent/ModifyStudentModal.jsx";
import QRModal from "@/components/modals/QRModal/QRModal.jsx";
import { getQR } from "@/services/QRServices.js";
import ErrorModal from "@/components/modals/GenericModals/ErrorModal.jsx";
import StudentProfile from "@/components/modals/studentProfile/StudentProfile.jsx";
import Modal from "react-bootstrap/Modal";
import ReturnBtn from "@/components/Return/ReturnBtn.jsx";

function Etudiants() {
  const PAGE_SIZE = 12;
  const DEBOUNCE_MS = 100;

  const [etudiants, setEtudiants] = useState([]);
  const [page, setPage] = useState(1);
  const [order, setOrder] = useState("id");
  const [search, setSearch] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [sortDir, setSortDir] = useState("-");
  const [showConfirmDel, setShowConfirmDel] = useState(false);

  const [showModify, setShowModify] = useState(false);
  const [student, setStudent] = useState({});

  const inputRef = useRef(null);

  const [showLoading, setShowLoading] = useState(false);

  const timerRef = useRef(null);
  const requestIdRef = useRef(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  async function fetchStudents() {
    setShowLoading(true);
    const thisRequestId = ++requestIdRef.current;

    try {
      // Fetch all students without any parameters
      const { status, students } = await getAllStudents();

      if (thisRequestId !== requestIdRef.current) return;

      if (status === 200) {
        setEtudiants(students ?? []);
      } else {
        setEtudiants([]);
        setErrMsg(
          "Un problème est survenu lors du chargement des étudiants, Veuillez réessayez.",
        );
        setErrCode(status);
        setShowError(true);
      }
    } catch {
      if (thisRequestId !== requestIdRef.current) return;

      setEtudiants([]);
      setErrMsg(
        "Une erreur s'est produite lors du chargement des étudiants, veuillez réessayer plus tard.",
      );
      setErrCode(500);
      setShowError(true);
    } finally {
      setShowLoading(false);
    }
  }

  // Fetch only on mount
  useEffect(() => {
    fetchStudents();
  }, []);

  // Filter and sort students locally
  const filteredAndSortedEtudiants = useMemo(() => {
    let result = [...etudiants];

    // Filter by search
    if (search.trim()) {
      const searchLower = search.toLowerCase().trim();
      result = result.filter((stud) => {
        return (
          stud.name?.toLowerCase().includes(searchLower) ||
          stud.email?.toLowerCase().includes(searchLower) ||
          stud.id?.toString().includes(searchLower)
        );
      });
    }

    // Sort locally
    result.sort((a, b) => {
      let comparison = 0;

      if (order === "name") {
        const nameA = (a.name || "").toLowerCase();
        const nameB = (b.name || "").toLowerCase();
        comparison = nameA.localeCompare(nameB);
      } else if (order === "id") {
        comparison = (a.id || 0) - (b.id || 0);
      }

      // Apply sort direction
      return sortDir === "-" ? -comparison : comparison;
    });

    return result;
  }, [etudiants, search, order, sortDir]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAndSortedEtudiants.length / PAGE_SIZE),
  );

  // Reset to page 1 when search, order, or sortDir changes
  useEffect(() => {
    setPage(1);
  }, [search, order, sortDir]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [filteredAndSortedEtudiants.length, totalPages, page]);

  const pageData = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredAndSortedEtudiants.slice(start, start + PAGE_SIZE);
  }, [filteredAndSortedEtudiants, page]);

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

  function handleFilter(param) {
    setOrder(param);
  }

  function handleSortDir() {
    setSortDir(sortDir === "-" ? "" : "-");
  }

  function handleInputChange(e) {
    const val = e.target.value;
    setInputValue(val);

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      setSearch(val);
    }, DEBOUNCE_MS);
  }

  async function handleDelClick(id) {
    setConfirmTitle("Supprimer un étudiant");
    setConfirmMsg("Êtes-vous sûr de vouloir supprimer cet étudiant?");
    setConfirmFunc(() => () => handleDelete(id));
    setShowConfirmDel(true);
  }

  async function handleDelete(id) {
    await deleteStudent(id);
    await fetchStudents();
  }

  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmMsg, setConfirmMsg] = useState("");
  const [confirmFunc, setConfirmFunc] = useState(null);

  async function handleEditClick(stud) {
    setStudent(stud);
    setShowModify(true);
  }

  async function finishModify() {
    setShowModify(false);
    await fetchStudents();
  }

  async function handleShowQr(id) {
    try {
      const { status, blob } = await getQR(id);

      if (status === 200) {
        setQrSrc(URL.createObjectURL(blob));
      } else {
        setErrMsg(
          "Une erreur s'est produite lors de la récupération du code QR de l'étudiant. Veuillez réessayer.",
        );
        setErrCode(500);
        setShowError(true);
      }
    } catch {
      setErrMsg(
        "Une erreur s'est produite lors de la récupération du code QR de l'étudiant. Veuillez réessayer.",
      );
    }
    setShowQR(true);
  }

  const [showQR, setShowQR] = useState(false);
  const [qrSrc, setQrSrc] = useState(false);

  const [showError, setShowError] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [errCode, setErrCode] = useState("");

  const [showProfile, setShowProfile] = useState(false);
  const [studentData, setStudentData] = useState({});

  function handleStudClick(data) {
    setStudentData(data);
    setShowProfile(true);
  }

  const [FSModal, setFSModal] = useState(() =>
    typeof window !== "undefined" && window.innerWidth >= 992 ? false : true,
  );

  useEffect(() => {
    const handleResize = () => {
      if (typeof window === "undefined") return;
      setFSModal(window.innerWidth >= 992 ? false : true);
    };

    if (typeof window !== "undefined") {
      window.addEventListener("resize", handleResize);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", handleResize);
      }
    };
  }, []);

  return (
    <>
      <Modal
        show={showProfile}
        centered={true}
        onHide={() => {
          setShowProfile(false);
          fetchStudents();
        }}
        size="lg"
        fullscreen={FSModal}
      >
        <Modal.Header className={styles.modalheader} closeButton></Modal.Header>
        <Modal.Body>
          <StudentProfile data={studentData}></StudentProfile>
        </Modal.Body>
      </Modal>
      <ErrorModal
        show={showError}
        onClose={() => setShowError(false)}
        code={errCode}
        message={errMsg}
      />
      <QRModal
        show={showQR}
        onClose={() => setShowQR(false)}
        title="Code QR"
        src={qrSrc}
      />
      <ConfirmModal
        show={showConfirmDel}
        onClose={() => setShowConfirmDel(false)}
        btn_no={"Annuler"}
        btn_yes={"Confirmer"}
        message={confirmMsg}
        title={confirmTitle}
        func={confirmFunc}
      />
      <ModifyStudentModal
        show={showModify}
        student={student}
        onClose={() => setShowModify(false)}
        onSuccess={() => finishModify()}
      />
      <ReturnBtn route="/dashboard"></ReturnBtn>
      <div className={styles.page}>
        <h1>Etudiants</h1>
        <div className={styles.content}>
          <div className={styles.filters}>
            <div className={styles.sort}>
              <Dropdown>
                <Dropdown.Toggle variant="secondary">Trier par</Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => handleFilter("name")}>
                    Ordre Alphabétique
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => handleFilter("id")}>
                    Date d'inscription
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
              <Button onClick={() => handleSortDir()} variant="secondary">
                {sortDir === "" ? (
                  <div className={styles.arrbtn}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="1em"
                      height="1em"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        d="m2 8l6-6l6 6m-3 13h11m-11-4h8m-8-4h5M8 2v20"
                      />
                    </svg>
                    <p>Croissant</p>
                  </div>
                ) : (
                  <div className={styles.arrbtn}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="1em"
                      height="1em"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        d="m2 16l6 6l6-6M11 3h11M11 7h8m-8 4h5M8 22V2"
                      />
                    </svg>
                    <p>Décroissant</p>
                  </div>
                )}
              </Button>
            </div>
            <Form
              onSubmit={(e) => {
                e.preventDefault();
              }}
            >
              <InputGroup>
                <Form.Control
                  ref={inputRef}
                  className={styles.searchfield}
                  placeholder="Qui cherchez-vous ?"
                  value={inputValue}
                  onChange={handleInputChange}
                  aria-label="Recherche d'étudiant"
                />
              </InputGroup>
            </Form>
          </div>

          {showLoading === true ? (
            <div className={styles.loading}>
              <div>
                <Spinner />
              </div>
            </div>
          ) : pageData.length === 0 && search === "" ? (
            <div className={styles.empty}>
              <h1>Aucun étudiant pour le moment.</h1>
            </div>
          ) : pageData.length === 0 && search !== "" ? (
            <div className={styles.empty}>
              <h1>Aucun résultat pour "{search}"</h1>
            </div>
          ) : (
            <>
              <table className={styles.table}>
                <tbody>
                  {pageData.map((stud) => (
                    <tr key={stud.id}>
                      <td
                        className={styles.namecol}
                        onClick={() => handleStudClick(stud)}
                      >
                        {stud.name}
                      </td>
                      <td>
                        <button
                          className={styles.qrbtn}
                          onClick={() => handleShowQr(stud.id)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="1.4em"
                            height="1.4em"
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
                        <button
                          className={styles.editbtn}
                          onClick={() => handleEditClick(stud)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="1.15em"
                            height="1.15em"
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
                        <button
                          className={styles.delbtn}
                          onClick={() => handleDelClick(stud.id)}
                        >
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
                  ))}
                </tbody>
              </table>

              <div className={styles.controlbtns}>
                <nav>
                  <button
                    onClick={() => goToPage(page - 1)}
                    disabled={page === 1}
                  >
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
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default Etudiants;
