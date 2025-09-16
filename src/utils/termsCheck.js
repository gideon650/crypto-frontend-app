// src/utils/termsCheck.js
export const checkTermsAccepted = () => {
  return localStorage.getItem("termsAccepted") === "true";
};

export const requireTermsAcceptance = (navigate) => {
  if (!checkTermsAccepted()) {
    navigate("/terms");
    return false;
  }
  return true;
};

export const setTermsAccepted = () => {
  localStorage.setItem("termsAccepted", "true");
};