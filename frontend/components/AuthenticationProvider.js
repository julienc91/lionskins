import React, { createContext, useContext, useEffect, useState } from "react";
import { gql } from "@apollo/client";
import axios from "axios";
import PropTypes from "prop-types";
import { client } from "../apollo";

export const getUserQuery = gql`
  query {
    currentUser {
      id
      username
    }
  }
`;

const AuthContext = createContext({});

export const AuthenticationProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const getUser = async () => {
    let res;
    try {
      res = await client.query({ query: getUserQuery });
    } catch (err) {
      return;
    }
    const user = res.data.currentUser;
    if (user) {
      setUser(user);
    }
  };

  const login = async () => {
    setLoading(true);
    await getUser();
    setLoading(false);
  };

  const logout = () => {
    axios.get(`${process.env.NEXT_PUBLIC_API_DOMAIN}/logout/`, {
      withCredentials: true,
    });
    setUser(null);
  };

  useEffect(() => {
    (async () => {
      await getUser();
      setLoading(false);
    })();
  }, []);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated: !!user, user, login, loading, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

AuthenticationProvider.propTypes = {
  children: PropTypes.node,
};

export default function useAuth() {
  return useContext(AuthContext);
}
