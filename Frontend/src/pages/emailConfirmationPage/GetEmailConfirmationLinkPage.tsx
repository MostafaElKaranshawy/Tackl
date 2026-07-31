import { useState } from "react";
import { getEmailConfirmationLink } from "../../services/authService";

export default function GetEmailConfirmationLinkPage() {
    const [email, setEmail] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await getEmailConfirmationLink(email);
            console.log("Confirmation link sent:", response);
            alert("Confirmation link sent to your email.");
        } catch (error) {
            console.error("Error sending confirmation link:", error);
            alert("Error sending confirmation link. Please try again.");
        }
    }

    return (
        <div>
            <h1>Get Email Confirmation Link</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    Email:
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </label>
                <button type="submit">Send Confirmation Link</button>
            </form>
        </div>
    );
}
