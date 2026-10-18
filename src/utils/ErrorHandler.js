export const ErrorHandler = (error) => {
  const message =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "Something went wrong. Please try again.";

  // Sirf error message return karo.
  // Yahan localStorage.clear() ya window.location.href mat chalao.
  return new Error(message);
};