export default async function passwordValidator(req: any, res: any, next: any) {
    const { password } = req.body;
    
    if (!password) {
        return res.status(400).json({ message: "Password is required" });
    }

    if (password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters long" });
    }

    if (!/[A-Z]/.test(password)) {
        return res.status(400).json({ message: "Password must contain at least one uppercase letter" });
    }

    if (!/[a-z]/.test(password)) {
        return res.status(400).json({ message: "Password must contain at least one lowercase letter" });
    }

    if (!/[0-9]/.test(password)) {
        return res.status(400).json({ message: "Password must contain at least one number" });
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        return res.status(400).json({ message: "Password must contain at least one special character" });
    }

    next();
}
