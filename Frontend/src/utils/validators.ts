const validatePasswordRules = [
    {
        label: "At least 8 characters",
        validate: (password: string) => password.length >= 8,
    },
    {
        label: "At least one uppercase letter",
        validate: (password: string) => /[A-Z]/.test(password),

    },
    {
        label: "At least one lowercase letter",
        validate: (password: string) => /[a-z]/.test(password),
    },
    {
        label: "At least one number",
        validate: (password: string) => /[0-9]/.test(password),
    },
    {
        label: "At least one special character",
        validate: (password: string) => /[!@#$%^&*(),.?":{}|<>]/.test(password),
    },
];
const validatePassword = (password: string, setPasswordError: (error: string) => void) => {
    setPasswordError("");
    const is_valid = validatePasswordRules.every(rule => rule.validate(password));
    if (!is_valid) {
        setPasswordError("Password does not meet the required criteria.");
    } else {
        setPasswordError("");
    }
    return is_valid;
}
const validateName = (name: string, setNameError: (error: string) => void) => {
    setNameError("");
    if (!name) {
        setNameError("Name is required");
        return false;
    } else if (!/^[A-Za-z ]+$/.test(name)) {
        setNameError("Name can only contain english letters and spaces");
        return false;
    }
    else {
        setNameError("");
        return true;
    }
}
const validateEmail = (email: string, setEmailError: (error: string) => void) => {
    setEmailError("");
    if (!email) {
        setEmailError("Email is required");
        return false;
    } else if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email)) {
        setEmailError("Email is invalid");
        return false;
    }
    else {
        setEmailError("");
        return true;
    }
}

export { validatePassword, validateName, validateEmail, validatePasswordRules };