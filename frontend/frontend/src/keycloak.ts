import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
  url: "http://localhost:8080", // URL-ul serverului Keycloak
  realm: "JobAppRealm",
  clientId: "job-app-frontend",
});

export default keycloak;