import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL + "/api/auth";

async function signUp(name: string, email: string, password: string) {
    if (!name || !email || !password) {
        throw new Error("Name, email, and password are required");
    }

    try {
        const response = await axios.post(`${API_URL}/signup`, {
            name,
            email,
            password
        });
        console.log("Sign up response:", response.data);
        return response.data;
    } catch (error) {
        throw new Error("Error signing up");
    }

}

async function login(email: string, password: string) {
    if (!email || !password) {
        throw new Error("Email and password are required");
    }
    
    try {
        const response = await axios.post(`${API_URL}/login`, {
            email,
            password
        }, { withCredentials: true });
        console.log("Login response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Login error:", error);
        throw new Error("Error logging in");
    }
}

async function getResetPasswordLink(email: string) {
    if (!email) {
        throw new Error("Email is required");
    }

    try {
        const response = await axios.get(`${API_URL}/getResetPasswordLink`, {
            params: { email }
        });
        console.log("Reset password link response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error getting reset password link:", error);
        throw new Error("Error getting reset password link");
    }
}

async function resetPassword(password: string, token: string) {
    if (!password || !token) {
        throw new Error("Password and token are required");
    }

    try {
        const response = await axios.put(`${API_URL}/resetPassword`, {
            password
        },
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
        console.log("Reset password response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error resetting password:", error);
        throw new Error("Error resetting password");
    }
}

async function confirmEmail(token: string) {
    if (!token) {
        throw new Error("Token is required");
    }

    try {
        const response = await axios.get(`${API_URL}/confirmEmail`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        console.log("Confirm email response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error confirming email:", error);
        throw new Error("Error confirming email");
    }
}

async function getEmailConfirmationLink(email: string) {
    if (!email) {
        throw new Error("Email is required");
    }

    try {
        const response = await axios.get(`${API_URL}/getConfirmationLink`, {
            params: { email }
        });
        console.log("Get confirmation link response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error getting confirmation link:", error);
        throw new Error("Error getting confirmation link");
    }
}
export {
    signUp,
    login,
    getResetPasswordLink,
    resetPassword,
    confirmEmail,
    getEmailConfirmationLink
}