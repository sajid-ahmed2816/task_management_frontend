export const ErrorHandler = (error) => {
  if (error.response) {
    if (error.response.status == 403) {
      localStorage.clear();
      window.location.href = "/login"
      return error.response.data.message;
    } else {
      return error.response.data.message;
    };
  };
};