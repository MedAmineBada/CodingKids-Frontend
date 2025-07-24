function StudentProfile({ data }) {
  return (
    <div>
      <h1>Student Profile</h1>
      <div>
        <p>Name: {data["name"]}</p>
        <p>Email: {data["email"]}</p>
        <p>Tel. 1: {data["tel1"]}</p>
        <p>Tel. 2: {data["tel2"]}</p>
        <p>Date de naissance: {data["birth_date"]}</p>
      </div>
    </div>
  );
}

export default StudentProfile;
