function Scan() {
  if (localStorage.getItem("scanResult") === null) {
    window.history.back();
  }

  return <div></div>;
}

export default Scan;
