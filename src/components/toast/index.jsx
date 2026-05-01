import toast from 'react-hot-toast';

const toastify = (promise) => {
  return toast.promise(promise, {
    loading: "Please wait",
    success: (data) => data?.message,
    error: (err) => err.message
  });
};

export default toastify;