import { useEffect, useRef, useState } from 'react'
import { Loader2, AlertCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAppDispatch } from '@/store/hooks'
import { createTaskThunk, updateTaskThunk } from '../store/taskSlice'
import type { Task, Priority } from '../types'

interface TaskFormModalProps {
  open: boolean
  onClose: () => void
  mode: 'create' | 'edit'
  task?: Task
}

interface FormState {
  title: string
  description: string
  priority: Priority
  dueDate: string
}

const empty: FormState = { title: '', description: '', priority: 'medium', dueDate: '' }

export function TaskFormModal({ open, onClose, mode, task }: TaskFormModalProps) {
  const dispatch = useAppDispatch()
  const [form, setForm] = useState<FormState>(empty)
  const [errors, setErrors] = useState<Partial<FormState>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const dateRef = useRef<HTMLInputElement & { showPicker?: () => void }>(null)

  useEffect(() => {
    if (open) {
      setForm(
        mode === 'edit' && task
          ? { title: task.title, description: task.description, priority: task.priority, dueDate: task.dueDate }
          : empty
      )
      setErrors({})
      setSubmitError(null)
    }
  }, [open, mode, task])

  const validate = (): boolean => {
    const e: Partial<FormState> = {}
    if (!form.title.trim()) e.title = 'Title is required'
    if (!form.dueDate) e.dueDate = 'Due date is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      if (mode === 'create') {
        await dispatch(createTaskThunk({
          title: form.title.trim(),
          description: form.description.trim(),
          priority: form.priority,
          dueDate: form.dueDate,
        })).unwrap()
      } else if (task) {
        await dispatch(updateTaskThunk({
          id: task.id,
          updates: {
            title: form.title.trim(),
            description: form.description.trim(),
            priority: form.priority,
            dueDate: form.dueDate,
          },
        })).unwrap()
      }
      onClose()
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const setField = (field: keyof FormState, value: string) => {
    setForm((f) => ({ ...f, [field]: value }))
    setErrors((e) => ({ ...e, [field]: undefined }))
    setSubmitError(null)
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Create Task' : 'Edit Task'}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-2.5">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Task title"
              value={form.title}
              onChange={(e) => setField('title', e.target.value)}
            />
            {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
          </div>

          <div className="flex flex-col gap-2.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Optional description"
              value={form.description}
              onChange={(e) => setField('description', e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2.5">
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={(v) => setField('priority', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2.5">
              <Label htmlFor="dueDate">Due Date *</Label>
              <Input
                ref={dateRef}
                id="dueDate"
                type="date"
                value={form.dueDate}
                onChange={(e) => setField('dueDate', e.target.value)}
                onClick={() => dateRef.current?.showPicker?.()}
              />
              {errors.dueDate && <p className="text-xs text-destructive">{errors.dueDate}</p>}
            </div>
          </div>
        </div>

        <div className="min-h-[36px]">
          {submitError && (
            <div className="flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {submitError}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === 'create' ? 'Create' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
