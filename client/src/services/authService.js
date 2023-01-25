import axios from "axios";
import { toast } from "react-toastify";

export const BACKEND_URL = "http://localhost:5000";


// Register User
export const registerUser = async (userData) => {
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/users/register`,
        userData,
        { withCredentials: true }
      );
      if (response.statusText === "OK") {
        toast.success("User Registered successfully");
    
      }
      return response.data;
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      toast.error(message);
    }
  };