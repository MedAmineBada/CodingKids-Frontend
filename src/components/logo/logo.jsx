import logo from "../../assets/images/logo.png";

function Logo({ className }) {
  return (
    <div className={className}>
      <img style={{ width: "100%" }} src={logo} alt="coding kids logo" />
    </div>
  );
}

export default Logo;
