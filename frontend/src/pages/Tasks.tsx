import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { taskService, type Task } from "@/services/taskService"
import { LoadingSpinner } from "@/components/common/LoadingSpinner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDate } from "@/utils/formatters"
import { CheckCircle2, Clock, ListTodo } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export const Tasks = () => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("pending")

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    try {
      setLoading(true)
      const data = await taskService.getUserTasks()
      setTasks(data)
    } catch (err: any) {
      console.error("Failed to load tasks:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleCompleteTask = async (taskId: string) => {
    try {
      await taskService.completeTask(taskId)
      await loadTasks()
      toast({
        title: "Task Completed",
        description: "The task has been marked as completed.",
      })
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || "Failed to complete task"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const filteredTasks = tasks.filter((task) => {
    if (filter === "pending") return task.status === "PENDING"
    if (filter === "completed") return task.status === "COMPLETED"
    return true
  })

  const pendingCount = tasks.filter((t) => t.status === "PENDING").length
  const completedCount = tasks.filter((t) => t.status === "COMPLETED").length

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Tasks</h1>
        <p className="text-muted-foreground mt-2">Tasks assigned to you across all projects</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <ListTodo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasks.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{pendingCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{completedCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
        <TabsList>
          <TabsTrigger value="all">
            All ({tasks.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({pendingCount})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="space-y-3">
          {filteredTasks.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground">
                  {filter === "pending"
                    ? "No pending tasks"
                    : filter === "completed"
                    ? "No completed tasks"
                    : "No tasks"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredTasks.map((task) => (
              <Card
                key={task.id}
                className={task.status === "PENDING" ? "border-l-4 border-l-yellow-600 dark:border-l-yellow-400" : "border-l-4 border-l-green-600 dark:border-l-green-400"}
              >
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{task.title}</h3>
                        <Badge
                          variant={task.status === "PENDING" ? "secondary" : "default"}
                          className={
                            task.status === "PENDING"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                              : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          }
                        >
                          {task.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{task.description}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        {task.dueDate && <span>Due: {formatDate(task.dueDate)}</span>}
                        {task.project && <span>Project: {task.project.name}</span>}
                        {task.completedAt && <span>Completed: {formatDate(task.completedAt)}</span>}
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {task.status === "PENDING" && (
                        <Button onClick={() => handleCompleteTask(task.id)} size="sm">
                          Complete
                        </Button>
                      )}
                      {task.project && (
                        <Button
                          onClick={() => navigate(`/projects/${task.projectId}`)}
                          variant="outline"
                          size="sm"
                        >
                          View Project
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
