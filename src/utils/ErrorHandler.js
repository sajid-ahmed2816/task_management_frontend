export const ErrorHandler = (error) => {
  if (error.response) {
    if (error.response.status == 403 || error.response.status == 401) {
      localStorage.clear();
      window.location.href = "/login"
      return error.response.data.message;
    } else {
      return error.response.data;
    };
  } else {
    return error;
  }
};