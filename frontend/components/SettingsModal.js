import React from "react";
import { useRouter } from "next/router";
import useTranslation from "next-translate/useTranslation";
import PropTypes from "prop-types";
import { Form, Modal, Select } from "semantic-ui-react";
import { Currencies } from "../utils/enums";
import useSettings from "./SettingsProvider";

const SettingsModal = ({ onClose, open }) => {
  const { t } = useTranslation("common");
  const router = useRouter();
  const { currency, changeCurrency } = useSettings();

  if (!open) {
    return null;
  }

  return (
    <Modal open={open} onClose={onClose}>
      <Modal.Header>{t("settings.title")}</Modal.Header>
      <Modal.Content>
        <Form>
          <Form.Field
            control={Select}
            label={t("settings.language.label")}
            options={[
              {
                key: "en",
                flag: "gb",
                text: t("settings.language.en"),
                value: "en",
              },
              {
                key: "fr",
                flag: "fr",
                text: t("settings.language.fr"),
                value: "fr",
              },
            ]}
            value={router.locale}
            onChange={(_, { value }) =>
              router.push(router.asPath, null, { locale: value })
            }
          />
          <Form.Field
            control={Select}
            label={t("settings.currency.label")}
            options={[
              {
                key: "usd",
                icon: "usd",
                text: t("settings.currency.usd"),
                value: Currencies.usd,
              },
              {
                key: "eur",
                icon: "euro sign",
                text: t("settings.currency.eur"),
                value: Currencies.eur,
              },
            ]}
            value={currency}
            onChange={(e, { value }) => changeCurrency(value)}
          />
        </Form>
      </Modal.Content>
    </Modal>
  );
};

SettingsModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default SettingsModal;
