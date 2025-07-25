interface StatBarProps {
  label: string
  value: number
  maxValue: number
  color?: string
}

export default function StatBar({ label, value, maxValue, color = "bg-[#8BAC0F]" }: StatBarProps) {
  const percentage = (value / maxValue) * 100

  return (
    <div className="space-y-1">
      <div className="flex justify-between pixel-font text-xs">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="bg-gray-300 border border-black h-4 relative">
        <div
          className={`${color} h-full border-r border-black transition-all duration-300`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  )
}
