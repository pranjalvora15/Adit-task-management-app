import { ListTodo, Clock, CheckCircle2 } from 'lucide-react'
import { useAppSelector } from '@/store/hooks'
import { selectTaskCounts } from '@/features/tasks/store/taskSlice'

export function TaskStats() {
  const { total, pending, completed } = useAppSelector(selectTaskCounts)

  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-4">
      <StatCard icon={<ListTodo className="h-5 w-5 text-primary" />} label="Total" value={total} />
      <StatCard icon={<Clock className="h-5 w-5 text-yellow-500" />} label="Pending" value={pending} color="text-yellow-600 dark:text-yellow-400" />
      <StatCard icon={<CheckCircle2 className="h-5 w-5 text-green-500" />} label="Completed" value={completed} color="text-green-600 dark:text-green-400" />
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  color = 'text-foreground',
}: {
  icon: React.ReactNode
  label: string
  value: number
  color?: string
}) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border bg-card p-3 shadow-sm sm:p-4">
      <div className="flex items-center gap-1 text-muted-foreground sm:gap-2">
        <span className="hidden sm:block">{icon}</span>
        <span className="text-xs font-medium sm:text-sm">{label}</span>
      </div>
      <p className={`text-xl font-bold sm:text-2xl ${color}`}>{value}</p>
    </div>
  )
}
