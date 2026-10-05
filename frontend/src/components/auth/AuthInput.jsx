const AuthInput = ({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  required = true,
}) => {
  return (
    <div className="mb-5">
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-semibold text-gray-700"
      >
        {label}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        autoComplete={name}
        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-gray-800 outline-none transition duration-200 placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      />
    </div>
  );
};

export default AuthInput;