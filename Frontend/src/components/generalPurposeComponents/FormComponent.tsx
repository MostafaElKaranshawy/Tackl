import { useState, type ReactNode } from "react";

type AuthFormProps = {
    title: string;
    subtitle: string;
    submitText: string;
    validateForm?: (e: React.FormEvent<HTMLFormElement>) => boolean;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
    children: ReactNode;
    footer?: ReactNode;
};

export default function FormComponent({
    title,
    subtitle,
    submitText,
    validateForm,
    onSubmit,
    children,
    footer,
}: AuthFormProps) {

    const [isSubmitting, setIsSubmitting] = useState(false);

    return (
        <div className="container max-w-md rounded-md border border-gray-300 bg-white p-10 pt-20 pb-20 shadow-lg shadow-gray-500/50 flex flex-col items-center">
            <div className="mb-10 flex flex-col items-center font-mono">
                <h1 className="mb-2 text-4xl text-center">{title}</h1>
                <p className="text-xs text-gray-600">{subtitle}</p>
            </div>

            <form onSubmit={async (e) => {
                e.preventDefault();
                setIsSubmitting(true);
                if(validateForm && !validateForm(e)) {
                    setIsSubmitting(false);
                    return;
                }
                await onSubmit(e);
                setIsSubmitting(false);
            }} className="flex w-full flex-col gap-4">
                {children}

                <button
                    type="submit"
                    className={"cursor-pointer rounded-md bg-blue-500 p-2 text-white hover:bg-blue-600"}
                    disabled={isSubmitting}
                >
                    {submitText}
                </button>
            </form>

            {footer && <div className="pt-10 flex flex-col">{footer}</div>}
        </div>
    );
}