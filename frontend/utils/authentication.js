import StorageManager from "./StorageManager";

class AuthenticationManager {
  startOpenId() {
    StorageManager.set(
      "openid.redirect",
      window.location.pathname.substr(3),
      false
    );
    window.location = `${process.env.NEXT_PUBLIC_API_DOMAIN}/authentication/login/steam/`;
  }
}

export default new AuthenticationManager();
