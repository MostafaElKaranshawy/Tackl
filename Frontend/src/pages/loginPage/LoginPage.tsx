import { useState, useEffect } from 'react';
import { login } from '../../services/authService';
import FloatingInput from '../../components/FloatingInput';
import { FaEye, FaEyeSlash } from 'react-icons/fa6';
import FormComponent from '../../components/FormComponent';
import { validateEmail } from '../../utils/validators';
import { notify } from '../../utils/notify';
import axios from 'axios';
import { checkAuthentication } from '../../services/authService';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        const verifyAuthentication = async () => {
            try {
                const authenticated = await checkAuthentication();
                if (authenticated) {
                    window.location.href = '/home';
                }
            } finally {
            }
        };

        verifyAuthentication();
    }, []);

    const resetForm = () => {
        setPassword('');
        setEmail('');
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            await login(email, password).then(() => {
                resetForm();
                window.location.href = '/home';
            });
        } catch (error) {
            resetForm();
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 400) {
                    notify.error("Invalid input. Please check your details and try again.");
                } else if (error.response?.status === 401) {
                    notify.error("Invalid email or password. Please try again.");
                } else {
                    notify.error("An unexpected error occurred. Please try again.");
                }

            } else {
                notify.error("An unexpected error occurred. Please try again.");
            }
        }
    }
    const inputGroupClassName = "input-group relative w-full";
    return (
        <FormComponent
            title="Login"
            subtitle="Sign in to your account"
            submitText="Login"
            validateForm={() => {
                validateEmail(email, setEmail);
            }}
            onSubmit={handleSubmit}
            children={
                <>
                    <FloatingInput
                        label="Email"
                        type="email"
                        value={email}
                        onChangeHandler={(e) => setEmail(e.target.value)}
                    />
                    <div className={inputGroupClassName}>
                        <FloatingInput
                            label="Password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChangeHandler={(e) => setPassword(e.target.value)}
                        />
                        <span
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </span>
                    </div>
                </>
            }
            footer={
                <div>
                    <p className="text-sm text-gray-600">
                        Don't have an account? <a href="/" className="text-blue-500 hover:underline">
                            Sign Up here
                        </a>
                    </p>
                    <p className="text-sm text-gray-600">
                        Forgot password? <a href="/reset-password" className="text-blue-500 hover:underline">
                            Reset here
                        </a>
                    </p>
                </div>
            }
        />
    );
}