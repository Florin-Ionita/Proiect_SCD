import { Link } from "react-router-dom";
import keycloak from "../keycloak";

const Navbar = () => {
    return (
        <nav style={{ padding: "1rem", borderBottom: "1px solid #ccc", display: "flex", gap: "1rem", alignItems: "center" }}>
            <Link to="/"><strong>Job Portal</strong></Link>
            <div style={{ marginLeft: "auto", display: "flex", gap: "1rem" }}>
                <Link to="/">Home</Link>
                <Link to="/profile">Profile</Link>
                {keycloak.authenticated ? (
                    <button onClick={() => keycloak.logout()}>Logout</button>
                ) : (
                    <button onClick={() => keycloak.login()}>Login</button>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
