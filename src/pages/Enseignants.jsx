import styles from "./Enseignants.module.css";
import { deleteTeacher, getAllTeachers } from "@/services/TeacherServices.js";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Badge,
  Button,
  Dropdown,
  Form,
  InputGroup,
  Spinner,
} from "react-bootstrap";
import ConfirmModal from "@/components/modals/GenericModals/ConfirmModal.jsx";
import ErrorModal from "@/components/modals/GenericModals/ErrorModal.jsx";
import Modal from "react-bootstrap/Modal";
import ReturnBtn from "@/components/Return/ReturnBtn.jsx";
import TeacherProfile from "@/components/modals/TeacherProfile/TeacherProfile.jsx";
import AddBtn from "@/components/AddBtn/AddBtn.jsx";
import AddTeacher from "@/components/modals/AddTeacher/AddTeacher.jsx";
import ModifyTeacherModal from "@/components/modals/ModifyTeacher/ModifyTeacher.jsx";

function Enseignants() {
  const PAGE_SIZE = 12;
  const DEBOUNCE_MS = 100;

  const [teachers, setTeachers] = useState([]);
  const [page, setPage] = useState(1);
  const [order, setOrder] = useState("id");
  const [search, setSearch] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [sortDir, setSortDir] = useState("-");
  const [showConfirmDel, setShowConfirmDel] = useState(false);

  const [showModify, setShowModify] = useState(false);
  const [teacher, setTeacher] = useState({});

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

  async function fetchTeachers() {
    setShowLoading(true);
    const thisRequestId = ++requestIdRef.current;

    try {
      const { status, teachers } = await getAllTeachers(
        sortDir + order,
        search,
      );

      if (thisRequestId !== requestIdRef.current) return;

      if (status === 200) {
        setTeachers(teachers ?? []);
      } else {
        setTeachers([]);
        setErrMsg(
          "Un problème est survenu lors du chargement des enseignants, Veuillez réessayez.",
        );
        setErrCode(status);
        setShowError(true);
      }
    } catch {
      if (thisRequestId !== requestIdRef.current) return;

      setTeachers([]);
      setErrMsg(
        "Une erreur s’est produite lors du chargement des enseignants, veuillez réessayer plus tard.",
      );
      setErrCode(500);
      setShowError(true);
    } finally {
      setShowLoading(false);
    }
  }

  useEffect(() => {
    fetchTeachers();
  }, [order, sortDir, search]);

  const totalPages = Math.max(1, Math.ceil(teachers.length / PAGE_SIZE));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [teachers.length, totalPages, page]);

  const pageData = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return teachers.slice(start, start + PAGE_SIZE);
  }, [teachers, page]);

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
    if (sortDir === "-") {
      setSortDir("");
    } else {
      setSortDir("-");
    }
  }

  function handleSearch() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setSearch(inputValue);
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
    setConfirmTitle("Supprimer un Enseignant");
    setConfirmMsg("Êtes-vous sûr de vouloir supprimer cet enseignant?");
    setConfirmFunc(() => () => handleDelete(id));
    setShowConfirmDel(true);
  }

  async function handleDelete(id) {
    await deleteTeacher(id);
    await fetchTeachers();
  }

  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmMsg, setConfirmMsg] = useState("");
  const [confirmFunc, setConfirmFunc] = useState(null);

  async function handleEditClick(teacher) {
    setTeacher(teacher);
    setShowModify(true);
  }

  async function finishModify() {
    setShowModify(false);
    await fetchTeachers();
  }

  const [showError, setShowError] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [errCode, setErrCode] = useState("");

  const [showProfile, setShowProfile] = useState(false);
  const [teacherData, setTeacherData] = useState({});

  function handleTeacherClick(data) {
    setTeacherData(data);
    setShowProfile(true);
  }

  const [FSModal, setFSModal] = useState(
    () => !(typeof window !== "undefined" && window.innerWidth >= 992),
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
  const [showAdd, setShowAdd] = useState(false);
  return (
    <>
      <AddBtn func={() => setShowAdd(true)}></AddBtn>
      <AddTeacher
        show={showAdd}
        onHide={() => setShowAdd(false)}
        onSuccess={() => {
          setShowAdd(false);
          fetchTeachers();
        }}
      ></AddTeacher>
      <Modal
        show={showProfile}
        centered={true}
        onHide={() => {
          setShowProfile(false);
          fetchTeachers();
        }}
        size="m"
      >
        <Modal.Header className={styles.modalheader} closeButton></Modal.Header>
        <Modal.Body>
          <TeacherProfile data={teacherData}></TeacherProfile>
        </Modal.Body>
        <Modal.Footer style={{ border: "none" }}></Modal.Footer>
      </Modal>
      <ErrorModal
        show={showError}
        onClose={() => setShowError(false)}
        code={errCode}
        message={errMsg}
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
      <ModifyTeacherModal
        show={showModify}
        teacher={teacher}
        onClose={() => setShowModify(false)}
        onSuccess={() => finishModify()}
      />
      <ReturnBtn route="/dashboard"></ReturnBtn>
      <div className={styles.page}>
        <h1>Enseignants</h1>
        <div className={styles.content}>
          <div className={styles.filters}>
            <div className={styles.sort}>
              <Dropdown>
                <Dropdown.Toggle variant="secondary">Trier par</Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => handleFilter("id")}>
                    Date d'ajout
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => handleFilter("cin")}>
                    CIN
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => handleFilter("name")}>
                    Ordre Alphabétique
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
                handleSearch();
              }}
            >
              <InputGroup>
                <Form.Control
                  ref={inputRef}
                  className={styles.searchfield}
                  placeholder="Qui cherchez-vous ?"
                  value={inputValue}
                  onChange={handleInputChange}
                  aria-label="Recherche d'enseignant"
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
              <h1>Aucun enseignant pour le moment.</h1>
            </div>
          ) : (
            <>
              <table className={styles.table}>
                <tbody>
                  {pageData.map((teacher) => (
                    <tr key={teacher.id}>
                      <td
                        className={styles.namecol}
                        onClick={() => handleTeacherClick(teacher)}
                      >
                        {teacher.name}{" "}
                        <Badge bg="light" className={styles.badge}>
                          CIN:{teacher.cin}
                        </Badge>
                      </td>
                      <td>
                        <button
                          className={styles.qrbtn}
                          // onClick={() => handleShowQr(teacher.id)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="1.3em"
                            height="1.3em"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <g fill="currentColor">
                              <path d="M7.8 6.35c.56 0 1.01-.45 1.01-1.01S8.36 4.33 7.8 4.33s-1.01.45-1.01 1.01s.45 1.01 1.01 1.01Z" />
                              <path
                                fill-rule="evenodd"
                                d="M9.83 8.55c0-1.08-.91-1.86-2.03-1.86c-1.12 0-2.03.78-2.03 1.86v.51c0 .09.04.18.1.24c.06.06.15.1.24.1h3.38c.09 0 .18-.04.24-.1c.06-.06.1-.15.1-.24v-.51ZM5.75 11.5a.75.75 0 0 1 .75-.75h7a.75.75 0 0 1 0 1.5h-7a.75.75 0 0 1-.75-.75Zm0 3a.75.75 0 0 1 .75-.75h7a.75.75 0 0 1 0 1.5h-7a.75.75 0 0 1-.75-.75Z"
                                clip-rule="evenodd"
                              />
                              <path
                                fill-rule="evenodd"
                                d="M2.5 2.5c0-1.102.898-2 2-2h6.69c.562 0 1.092.238 1.465.631l.006.007l4.312 4.702c.359.383.527.884.527 1.36v10.3c0 1.102-.898 2-2 2h-11c-1.102 0-2-.898-2-2v-15Zm8.689 0H4.5v15h11V7.192l-4.296-4.685l-.003-.001a.041.041 0 0 0-.012-.006Z"
                                clip-rule="evenodd"
                              />
                              <path
                                fill-rule="evenodd"
                                d="M11.19.5a1 1 0 0 1 1 1v4.7h4.31a1 1 0 1 1 0 2h-5.31a1 1 0 0 1-1-1V1.5a1 1 0 0 1 1-1Z"
                                clip-rule="evenodd"
                              />
                            </g>
                          </svg>
                        </button>
                      </td>

                      <td onClick={() => handleEditClick(teacher)}>
                        <button className={styles.editbtn}>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="1.05em"
                            height="1.05em"
                            viewBox="0 0 384 384"
                          >
                            <path
                              fill="currentColor"
                              d="M0 304L236 68l80 80L80 384H0v-80zM378 86l-39 39l-80-80l39-39q6-6 15-6t15 6l50 50q6 6 6 15t-6 15z"
                            />
                          </svg>
                        </button>
                      </td>

                      <td onClick={() => handleDelClick(teacher.id)}>
                        <button className={styles.delbtn}>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="1.2em"
                            height="1.2em"
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

export default Enseignants;
