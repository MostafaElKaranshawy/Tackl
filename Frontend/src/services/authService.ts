import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL + "/api/auth";

async function signUp(name: string, email: string, password: string): Promise<any> {
    if (!name || !email || !password) {
        throw new Error("Name, email, and password are required");
    }
    try {
        const response = await axios.post(`${API_URL}/signup`, {
            name,
            email,
            password
        });
        return response.data;
    } catch (error) {
        throw error;
    }

}

async function login(email: string, password: string): Promise<any> {
    if (!email || !password) {
        throw new Error("Email and password are required");
    }
    
    try {
        const response = await axios.post(`${API_URL}/login`, {
            email,
            password
        }, { withCredentials: true });
        return response.data;
    } catch (error) {
        throw error;
    }
}

async function getResetPasswordLink(email: string): Promise<any> {
    if (!email) {
        throw new Error("Email is required");
    }

    try {
        const response = await axios.get(`${API_URL}/getResetPasswordLink`, {
            params: { email }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}

async function resetPassword(password: string, token: string) {
    if (!password || !token) {
        throw new Error("Password and token are required");
    }

    try {
        const response = await axios.put(`${API_URL}/resetPasswordFromLink`, {
            password
        },
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        throw error;
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
        return response.data;
    } catch (error) {
        throw error;
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
        return response.data;
    } catch (error) {
        throw error;
    }
}

async function checkAuthentication(): Promise<boolean> {
    try {
        await axios.get(`${API_URL}/checkAuthentication`, { withCredentials: true });
        return true;
    } catch (error) {
        return false;
    }
}

async function logout(): Promise<void> {
    try {
        await axios.post(`${API_URL}/logout`, {}, { withCredentials: true });
    } catch (error) {
        throw error;
    }
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