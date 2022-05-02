import React, { createContext, useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Currencies } from "../utils/enums";
import StorageManager from "../utils/StorageManager";

const SettingsContext = createContext({});

export const SettingsProvider = ({ children }) => {
  const [currency, setCurrency] = useState(SettingsManager.getCurrency());

  const changeCurrency = (value) => {
    setCurrency(value);
    SettingsManager.setCurrency(value);
  };

  return (
    <SettingsContext.Provider value={{ currency, changeCurrency }}>
      {children}
    </SettingsContext.Provider>
  );
};

SettingsProvider.propTypes = {
  children: PropTypes.node,
};

export class SettingsManager {
  static getCurrency() {
    return StorageManager.get("currency") || Currencies.eur;
  }

  static setCurrency(value) {
    StorageManager.set("currency", value);
  }
}

export default function useSettings() {
  return useContext(SettingsContext);
}
