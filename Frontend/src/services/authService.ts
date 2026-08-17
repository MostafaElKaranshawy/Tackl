import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL + "/api/auth";

async function signUp(name: string, email: string, password: string) {
    if (!name || !email || !password) {
        throw new Error("Name, email, and password are required");
    }
    const response = await axios.post(`${API_URL}/signup`, {
        name,
        email,
        password
    });
    return response.data;

}

async function login(email: string, password: string) {
    if (!email || !password) {
        throw new Error("Email and password are required");
    }
    const response = await axios.post(`${API_URL}/login`, {
        email,
        password
    }, { withCredentials: true });
    return response.data;
}

async function getResetPasswordLink(email: string) {
    if (!email) {
        throw new Error("Email is required");
    }
    const response = await axios.get(`${API_URL}/getResetPasswordLink`, {
        params: { email }
    });
    return response.data;
}

async function resetPassword(password: string, token: string) {
    if (!password || !token) {
        throw new Error("Password and token are required");
    }

    const response = await axios.put(`${API_URL}/resetPasswordFromLink`, {
        password
    },
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    return response.data;
}

async function confirmEmail(token: string) {
    if (!token) {
        throw new Error("Token is required");
    }

    const response = await axios.get(`${API_URL}/confirmEmail`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
}

async function getEmailConfirmationLink(email: string) {
    if (!email) {
        throw new Error("Email is required");
    }

    const response = await axios.get(`${API_URL}/getConfirmationLink`, {
        params: { email }
    });
    return response.data;
}

async function checkAuthentication(): Promise<boolean> {
    try {
        await axios.get(`${API_URL}/checkAuthentication`, { withCredentials: true });
        return true;
    } catch {
        return false;
    }
}

async function logout(): Promise<void> {
    await axios.post(`${API_URL}/logout`, {}, { withCredentials: true });
}

export {
    signUp,
    login,
    getResetPasswordLink,
    resetPassword,
    confirmEmail,
    getEmailConfirmationLink,
    checkAuthentication,
    logout
}