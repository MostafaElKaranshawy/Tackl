export default async function emailValidator(req: any, res: any, next: any) {
    const { email } = req.body;
    
    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email format" });
    }

    next();
}