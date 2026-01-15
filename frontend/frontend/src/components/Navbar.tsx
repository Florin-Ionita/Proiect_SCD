import { Link } from "react-router-dom";
import keycloak from "../keycloak";

const Navbar = () => {
    return (
        <nav className="navbar">
            <div className="navbar-brand">JobBoard</div>
            <div className="nav-links">
                <Link to="/" className="nav-link">Home</Link>
                {keycloak.authenticated ? (
                    <>
                        <Link to="/profile" className="nav-link">Profile</Link>
                        <button onClick={() => keycloak.logout()}>
                            Logout
                        </button>
                    </>
                ) : (
                    <button onClick={() => keycloak.login()}>
                        Login
                    </button>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
