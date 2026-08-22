import logo from "../../assets/logo.png";

export default function Logo() {
  return (
    <a className="brand" href="/" aria-label="PollyBlog home">
      <img className="brand-logo" src={logo} alt="PollyBlog" />
    </a>
  );
}