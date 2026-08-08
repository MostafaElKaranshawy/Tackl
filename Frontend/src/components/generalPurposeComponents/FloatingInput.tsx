type InputProps = {
  label: string;
  type?: string;
  value?: string;
  onChangeHandler?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function FloatingInput({
  label,
  type = "text",
  value,
  onChangeHandler,
}: InputProps) {

  return (
    <div className="relative">
      <input
        type={type}
        placeholder=" "
        value={value}
        onChange={(e) => onChangeHandler && onChangeHandler(e)}
        className="peer w-full rounded-lg border border-gray-300 px-4 pt-4 pb-2 outline-none focus:border-blue-500"
      />

      <label
        className="
          absolute left-4 top-4
          bg-white px-1
          text-gray-500
          transition-all duration-200
          pointer-events-none

          peer-placeholder-shown:top-4
          peer-placeholder-shown:text-base

          peer-focus:-top-2
          peer-focus:text-xs
          peer-focus:text-blue-500

          peer-not-placeholder-shown:-top-2
          peer-not-placeholder-shown:text-xs
        "
      >
        {label}
      </label>
    </div>
  );
}