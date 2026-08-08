import axios from 'axios';
import { useEffect, useState } from 'react';
import { notify } from "../../utils/notify";
import { checkAuthentication, signUp } from '../../services/authService';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import FloatingInput from '../../components/generalPurposeComponents/FloatingInput';
import FormComponent from '../../components/generalPurposeComponents/FormComponent';
import { validatePassword, validateName, validateEmail, validatePasswordRules } from '../../utils/validators';
import { useNavigate } from "react-router-dom";

export default function SignUpPage() {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [nameError, setNameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    useEffect(() => {
        const verifyAuthentication = async () => {
            const authenticated = await checkAuthentication();
            if (authenticated) {
                navigate("/projects");
            }
        };

        verifyAuthentication();
    }, [navigate]);

    const resetForm = () => {
        setName('');
        setEmail('');
        setPassword('');
    }
    const validateForm = () => {
        const isNameValid = validateName(name, setNameError);
        const isEmailValid = validateEmail(email, setEmailError);
        const isPasswordValid = validatePassword(password, setPasswordError);

        return isNameValid && isEmailValid && isPasswordValid;
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            if (!validateForm()) return;
            await signUp(name, email, password);
            resetForm();
            notify.success("Sign up successful! Please check your email to confirm your account.");
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 400) {
                    notify.error("Invalid input. Please check your details and try again.");
                } else if (error.response?.status === 409) {
                    notify.error("Email already exists. Please use a different email or log in using it.");
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
            title="Sign Up"
            subtitle="Create your account"
            submitText="Sign Up"
            validateForm={() => {
                if (!validateForm()) {
                    return false;
                }
                return true;
            }}
            onSubmit={handleSubmit}
            children={
                <>
                    <FloatingInput
                        label="Name"
                        type="text"
                        value={name}
                        onChangeHandler={(e) => {
                            setName(e.target.value)
                        }}
                    />
                    {nameError && <p className="text-xs text-red-500">{nameError}</p>}

                    <FloatingInput
                        label="Email"
                        type="email"
                        value={email}
                        onChangeHandler={(e) => setEmail(e.target.value)}
                    />
                    {emailError && <p className="text-xs text-red-500">{emailError}</p>}
                    <div className={inputGroupClassName}>
                        <FloatingInput
                            label="Password"
                            value={password}
                            type={showPassword ? "text" : "password"}
                            onChangeHandler={(e) => {
                                setPassword(e.target.value)
                                validatePassword(e.target.value, setPasswordError)
                            }}
                        />
                        <span
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </span>
                    </div>
                    {passwordError && <p className="text-xs text-red-500">{passwordError}</p>}
                    <div className="constraints mt-2 bg-yellow-100 p-2 rounded-md font-mono">
                        {validatePasswordRules.map((rule, index) => (
                            <p key={index} className={`text-xs ${rule.validate(password) ? "text-green-500" : "text-red-500"}`}>
                                {rule.label}
                            </p>
                        ))}
                    </div>
                </>
            }
            footer={
                <div>
                    <p className="text-sm text-gray-600">
                        Already have an account? <a href="/login" className="text-blue-500 hover:underline">
                            Login here
                        </a>
                    </p>
                    <p className="text-sm text-gray-600">
                        Didn't receive confirmation email? <a href="/confirm-email" className="text-blue-500 hover:underline">
                            Resend
                        </a>
                    </p>
                </div>
            }
        />
    );
}