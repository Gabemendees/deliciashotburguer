import { ButtonHTMLAttributes, forwardRef } from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const variants = {
      primary: 'bg-[#FFD700] text-black hover:bg-[#FFC000] active:scale-95 transition-all',
      secondary: 'bg-red-600 text-white hover:bg-red-700 active:scale-95 transition-all',
      outline: 'border-2 border-[#FFD700] text-black hover:bg-[#FFD700]/10',
      ghost: 'hover:bg-gray-100',
      danger: 'bg-red-100 text-red-600 hover:bg-red-200'
    }

    const sizes = {
      sm: 'px-3 py-1.5 text-sm rounded-lg',
      md: 'px-6 py-3 text-base font-bold rounded-xl',
      lg: 'px-8 py-4 text-lg font-bold rounded-2xl'
    }

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    )
  }
)

Button.displayName = "Button"

export { Button }
