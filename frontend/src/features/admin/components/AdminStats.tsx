import { useEffect, useState } from 'react'
import { Users, ListTodo, Clock, CheckCircle2 } from 'lucide-react'
import { useAppSelector } from '@/store/hooks'
import { selectAdminTotalUsers, selectAdminUsers } from '../store/adminSlice'
import { adminService } from '../adminService'

export function AdminStats() {
  const users = useAppSelector(selectAdminUsers)
  const totalUsers = useAppSelector(selectAdminTotalUsers)

  const [counts, setCounts] = useState({ total: 0, pending: 0, completed: 0 })

  useEffect(() => {
    Promise.all([
      adminService.getTasks({ limit: 1 }),
      adminService.getTasks({ limit: 1, status: 'pending' }),
      adminService.getTasks({ limit: 1, status: 'completed' }),
    ]).then(([all, pending, completed]) => {
      setCounts({ total: all.total, pending: pending.total, completed: completed.total })
    })
  }, [users.length])

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      <StatCard icon={<Users className="h-5 w-5 text-primary" />} label="Users" value={totalUsers} />
      <StatCard icon={<ListTodo className="h-5 w-5 text-primary" />} label="Total Tasks" value={counts.total} />
      <StatCard icon={<Clock className="h-5 w-5 text-yellow-500" />} label="Pending" value={counts.pending} color="text-yellow-600 dark:text-yellow-400" />
      <StatCard icon={<CheckCircle2 className="h-5 w-5 text-green-500" />} label="Completed" value={counts.completed} color="text-green-600 dark:text-green-400" />
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
