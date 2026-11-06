const variants = {
  primary: 'bg-cta border-2 border-white shadow-cta text-white',
  secondary: 'bg-white text-brand border border-brand',
}

/**
 * Button — full-width pill-less action button.
 * variant: 'primary' (brand fill) | 'secondary' (outline)
 */
export default function Button({ variant = 'primary', className = '', children, ...props }) {
  return (
    <button
      className={`w-full rounded-[8px] py-3 text-[16px] font-bold disabled:opacity-60 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
