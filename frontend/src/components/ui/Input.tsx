import { forwardRef } from "react";


const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
    ({ className = "", ...props }, ref) => (
        <input
            ref={ref}
            className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring ${className}`}
            {...props}
        />
    )
);
Input.displayName = "Input";
export default Input;