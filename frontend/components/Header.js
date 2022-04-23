import React, { useState } from "react";
import Link from "next/link";
import useTranslation from "next-translate/useTranslation";
import { Dropdown, Icon, Menu } from "semantic-ui-react";
import useAuth from "./AuthenticationProvider";
import LoginModal from "./LoginModal";
import SettingsModal from "./SettingsModal";

const Header = () => {
  const { t } = useTranslation("common");
  const { logout, user } = useAuth();
  const [openLoginModal, setOpenLoginModal] = useState(false);
  const [openSettingsModal, setOpenSettingsModal] = useState(false);

  const handleOpenSettingsModal = () => {
    setOpenLoginModal(false);
    setOpenSettingsModal(true);
  };

  const handleOpenLoginModal = () => {
    setOpenSettingsModal(false);
    setOpenLoginModal(true);
  };

  let inner;
  if (user) {
    inner = (
      <>
        <Menu.Item icon="setting" onClick={handleOpenSettingsModal} />
        <Menu.Item>
          <Dropdown
            item
            text={
              <>
                <Icon name="user" />
                {user.username}
              </>
            }
          >
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => logout()}>
                <Icon name="log out" />
                {t("header.logout")}
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Menu.Item>
      </>
    );
  } else {
    inner = (
      <>
        <Menu.Item icon="setting" onClick={handleOpenSettingsModal} />
        <Menu.Item icon="user" onClick={handleOpenLoginModal} />
      </>
    );
  }
  return (
    <Menu as="nav" inverted>
      <Menu.Item>
        <Link href="/">
          <a>
            <img src="/images/logo.svg" alt="LionSkins" />
          </a>
        </Link>
      </Menu.Item>
      <Menu.Item>
        <Link href="/counter-strike-global-offensive/">
          <a>
            <img
              src="/images/csgo.svg"
              alt="Counter-Strike: Global Offensive"
            />
          </a>
        </Link>
      </Menu.Item>
      <Menu.Menu position="right" className="menu-settings">
        {inner}
      </Menu.Menu>
      <LoginModal
        open={openLoginModal}
        onClose={() => setOpenLoginModal(false)}
      />
      <SettingsModal
        open={openSettingsModal}
        onClose={() => setOpenSettingsModal(false)}
      />
    </Menu>
  );
};

export default Header;
