export default async function nameValidator(req: any, res: any, next: any) {
    let { name } = req.body;

    if (!name) {
        return res.status(400).json({ message: "Name is required" });
    }

    name = name.trim();

    if (!/^[A-Za-z]+(?: [A-Za-z]+)*$/.test(name)) {
        return res.status(400).json({ message: "Name must contain only letters and spaces" });
    }

    req.body.name = name;
    
    next();
}