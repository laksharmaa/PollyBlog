import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Logo from "../common/Logo";
import Icon from "../common/Icon";
export default function Header({ isAuthenticated, onLogout, dark, onToggleTheme }) {
    const location = useLocation();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    useEffect(() => setOpen(false), [location.pathname]);
    const logout = () => {
        onLogout(); navigate("/")
    };
    return (
    <header
        className="site-header">
        <div className="header-inner">
            <Logo />
            <nav
                className={open ? "nav open" : "nav"}>
                <a className={location.pathname === "/" ? "active" : ""}
                    href="/">
                    Explore
                </a>
                {isAuthenticated && <a className={location.pathname === "/create-blog" ? "active" : ""} href="/create-blog">Write</a>}{isAuthenticated && <a className={location.pathname === "/saved-blogs" ? "active" : ""} href="/saved-blogs">Library</a>}<a className={location.pathname === "/text-to-speech" ? "active" : ""}
                href="/text-to-speech">Narrate</a>{isAuthenticated ? <button className="nav-button" onClick={logout}>Log out</button> : <a className="nav-button" href="/login">Sign in</a>}</nav><div className="header-actions"><button className="icon-button" onClick={onToggleTheme}><Icon name={dark ? "sun" : "moon"} /></button><button className="mobile-menu" onClick={() => setOpen(v => !v)}><Icon name={open ? "close" : "menu"} /></button></div></div></header>
    );
}
