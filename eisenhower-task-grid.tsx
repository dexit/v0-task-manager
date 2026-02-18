"use client"

import React, { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { PlusCircle, Trash2, Settings, Moon, Sun, HelpCircle, ComputerIcon as Microsoft, Edit } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Timeline, TimelineItem } from "@/components/ui/timeline"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useDraggable } from "@/hooks/useDraggable"
import {
  login,
  logout,
  getActiveAccount,
  fetchTasks,
  fetchOutlookTasks,
  fetchDynamicsTasks,
  clearOngoingInteractions,
} from "@/lib/o365auth"

interface Position {
  x: number
  y: number
}

interface Project {
  id: string
  name: string
  color: string
}

interface Task {
  id: string
  title: string
  description: string
  position: Position
  color: string
  loopLink?: string
  screenshot?: string
  urgency: number
  importance: number
  impact: number
  technicalDebt: number
  createdAt: Date
  projectId?: string
  source?: "local" | "o365" | "outlook" | "dynamics"
}

interface DraggableTaskProps {
  task: Task
  onDragEnd: (id: string, position: Position) => void
  onClick: (task: Task) => void
}

interface GridConfig {
  quadrantLabels: [string, string, string, string]
  xAxisLabel: string
  yAxisLabel: string
  showMeshGrid: boolean
}

function DraggableTask({ task, onDragEnd, onClick }: DraggableTaskProps) {
  const { position, dragState, containerRef, startDrag, getWobbleAnimation } = useDraggable(
    task.position,
    {
      onDragEnd: (pos) => onDragEnd(task.id, pos),
      onPositionChange: (pos) => onDragEnd(task.id, pos),
    },
  )

  const animationClass = getWobbleAnimation()

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          ref={containerRef}
          className={`absolute pointer-events-auto ${animationClass}`}
          style={{
            left: `${position.x}%`,
            top: `${position.y}%`,
          }}
        >
          <div
            onMouseDown={startDrag}
            className="transform -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing text-sm font-medium select-none px-3 py-1 rounded-full relative whitespace-nowrap"
            style={{
              backgroundColor: task.color,
              color: "#000",
              textAlign: "center",
            }}
            onClick={() => {
              // Only trigger click if small distance moved
              const distance = Math.sqrt(
                Math.pow(position.x - task.position.x, 2) + Math.pow(position.y - task.position.y, 2),
              )
              if (distance < 5) {
                onClick(task)
              }
            }}
          >
            {task.title}
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <div className="max-w-xs">
          <h3 className="font-bold mb-1">{task.title}</h3>
          <p className="text-sm mb-2">{task.description}</p>
          <div className="text-sm mb-1">Urgency: {task.urgency}</div>
          <div className="text-sm mb-1">Importance: {task.importance}</div>
          <div className="text-sm mb-1">Impact: {task.impact}</div>
          <div className="text-sm mb-2">Technical Debt: {task.technicalDebt}</div>
          <div className="text-sm mb-2">Source: {task.source}</div>
          {task.loopLink && (
            <a
              href={task.loopLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline text-sm"
            >
              MS Loop Link
            </a>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  )
}

export default function EisenhowerTaskGrid() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false)
  const [newTaskPosition, setNewTaskPosition] = useState<Position>({ x: 0, y: 0 })
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: "",
    description: "",
    loopLink: "",
    color: "#6AACF8",
    urgency: 5,
    importance: 5,
    impact: 5,
    technicalDebt: 5,
  })
  const [newProject, setNewProject] = useState<Partial<Project>>({
    name: "",
    color: "#6AACF8",
  })
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [gridConfig, setGridConfig] = useState<GridConfig>({
    quadrantLabels: ["Do", "Schedule", "Delegate", "Eliminate"],
    xAxisLabel: "Urgency",
    yAxisLabel: "Importance",
    showMeshGrid: false,
  })
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [activeTab, setActiveTab] = useState("grid")
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [o365Tasks, setO365Tasks] = useState<any[]>([])
  const [outlookTasks, setOutlookTasks] = useState<any[]>([])
  const [dynamicsTasks, setDynamicsTasks] = useState<any[]>([])
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  useEffect(() => {
    const root = window.document.documentElement
    if (isDarkMode) {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }
  }, [isDarkMode])

  useEffect(() => {
    const account = getActiveAccount()
    setIsLoggedIn(!!account)
  }, [])

  const handleLogin = async () => {
    try {
      console.log("Attempting to log in...")
      const account = await login()
      if (account) {
        console.log("Login successful:", account)
        setIsLoggedIn(true)
      } else {
        console.warn("Login returned null. An interaction may already be in progress.")
      }
    } catch (error) {
      console.error("Login failed:", error)
      // You might want to show an error message to the user here
    }
  }

  const handleLogout = async () => {
    await logout()
    setIsLoggedIn(false)
  }

  const handleFetchTasks = async () => {
    try {
      console.log("Fetching tasks...")
      const o365Tasks = await fetchTasks()
      console.log("O365 tasks:", o365Tasks)
      setO365Tasks(o365Tasks)
      const outlookTasks = await fetchOutlookTasks()
      console.log("Outlook tasks:", outlookTasks)
      setOutlookTasks(outlookTasks)
      const dynamicsTasks = await fetchDynamicsTasks()
      console.log("Dynamics tasks:", dynamicsTasks)
      setDynamicsTasks(dynamicsTasks)
      setIsImportModalOpen(true)
    } catch (error) {
      console.error("Error fetching tasks:", error)
      // You might want to show an error message to the user here
    }
  }

  const handleImportTask = (task: any, source: "o365" | "outlook" | "dynamics") => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: task.title || task.subject,
      description: task.body?.content || task.description || "",
      position: { x: Math.random() * 100, y: Math.random() * 100 },
      color: "#6AACF8",
      urgency: 5,
      importance: 5,
      impact: 5,
      technicalDebt: 5,
      createdAt: new Date(task.createdDateTime || task.createdon),
      source: source,
    }
    setTasks([...tasks, newTask])
  }

  const handleGridClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setNewTaskPosition({ x, y })
    setIsModalOpen(true)
  }

  const handleAddTask = () => {
    if (newTask.title) {
      const task: Task = {
        id: Date.now().toString(),
        title: newTask.title,
        description: newTask.description || "",
        position: newTaskPosition,
        color: newTask.color || "#6AACF8",
        loopLink: newTask.loopLink,
        screenshot: newTask.screenshot,
        urgency: newTask.urgency || 5,
        importance: newTask.importance || 5,
        impact: newTask.impact || 5,
        technicalDebt: newTask.technicalDebt || 5,
        createdAt: new Date(),
        projectId: newTask.projectId,
        source: "local",
      }
      setTasks([...tasks, task])
      setNewTask({
        title: "",
        description: "",
        loopLink: "",
        color: "#6AACF8",
        urgency: 5,
        importance: 5,
        impact: 5,
        technicalDebt: 5,
      })
      setIsModalOpen(false)
    }
  }

  const handleAddProject = () => {
    if (newProject.name) {
      const project: Project = {
        id: Date.now().toString(),
        name: newProject.name,
        color: newProject.color || "#6AACF8",
      }
      setProjects([...projects, project])
      setNewProject({
        name: "",
        color: "#6AACF8",
      })
      setIsProjectModalOpen(false)
    }
  }

  const handleEditProject = (project: Project) => {
    setEditingProject(project)
    setIsProjectModalOpen(true)
  }

  const handleUpdateProject = () => {
    if (editingProject) {
      setProjects(projects.map((p) => (p.id === editingProject.id ? editingProject : p)))
      setEditingProject(null)
      setIsProjectModalOpen(false)
    }
  }

  const handleDeleteProject = (projectId: string) => {
    setProjects(projects.filter((p) => p.id !== projectId))
    setTasks(tasks.map((t) => (t.projectId === projectId ? { ...t, projectId: undefined } : t)))
  }

  const handleTaskDragEnd = (id: string, position: Position) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, position } : task)))
  }

  const handleTaskClick = (task: Task) => {
    setEditingTask(task)
    setIsModalOpen(true)
  }

  const handleUpdateTask = () => {
    if (editingTask) {
      setTasks(tasks.map((t) => (t.id === editingTask.id ? editingTask : t)))
      setEditingTask(null)
      setIsModalOpen(false)
    }
  }

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter((t) => t.id !== taskId))
  }

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        if (editingTask) {
          setEditingTask({ ...editingTask, screenshot: reader.result as string })
        } else {
          setNewTask({ ...newTask, screenshot: reader.result as string })
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleClearTasks = () => {
    setTasks([])
  }

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  const groupTasksByProject = () => {
    const grouped: { [key: string]: Task[] } = { unassigned: [] }
    tasks.forEach((task) => {
      if (task.projectId) {
        if (!grouped[task.projectId]) {
          grouped[task.projectId] = []
        }
        grouped[task.projectId].push(task)
      } else {
        grouped.unassigned.push(task)
      }
    })
    return grouped
  }

  const getProjectName = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId)
    return project ? project.name : "Unknown Project"
  }

  const handleLoginRetry = () => {
    clearOngoingInteractions()
    handleLogin()
  }

  const filteredTasks = selectedProject ? tasks.filter((task) => task.projectId === selectedProject) : tasks

  return (
    <TooltipProvider>
      <div
        className="min-h-screen w-full bg-background text-foreground font-sans"
      >
        <style jsx global>{`
          body.dragging * {
            cursor: none !important;
          }
        `}</style>

        {/* Header */}
        <div className="w-full max-w-7xl mx-auto mb-8 flex flex-col sm:flex-row justify-between items-center p-4 gap-4">
          <h1 className="text-3xl font-bold">4-Way Task Grid</h1>
          <div className="flex flex-wrap items-center gap-4">
            <span>Tasks: {tasks.length}</span>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete all your tasks.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearTasks}>Yes, clear all tasks</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Config
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Grid Configuration</SheetTitle>
                </SheetHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="xAxisLabel" className="text-right">
                      X-Axis Label
                    </Label>
                    <Input
                      id="xAxisLabel"
                      value={gridConfig.xAxisLabel}
                      onChange={(e) => setGridConfig({ ...gridConfig, xAxisLabel: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="yAxisLabel" className="text-right">
                      Y-Axis Label
                    </Label>
                    <Input
                      id="yAxisLabel"
                      value={gridConfig.yAxisLabel}
                      onChange={(e) => setGridConfig({ ...gridConfig, yAxisLabel: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  {gridConfig.quadrantLabels.map((label, index) => (
                    <div key={index} className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor={`quadrant${index + 1}`} className="text-right">
                        Quadrant {index + 1}
                      </Label>
                      <Input
                        id={`quadrant${index + 1}`}
                        value={label}
                        onChange={(e) => {
                          const newLabels = [...gridConfig.quadrantLabels]
                          newLabels[index] = e.target.value
                          setGridConfig({
                            ...gridConfig,
                            quadrantLabels: newLabels as [string, string, string, string],
                          })
                        }}
                        className="col-span-3"
                      />
                    </div>
                  ))}
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="showMeshGrid"
                      checked={gridConfig.showMeshGrid}
                      onCheckedChange={(checked) => setGridConfig({ ...gridConfig, showMeshGrid: checked })}
                    />
                    <Label htmlFor="showMeshGrid">Show Mesh Grid</Label>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <Button variant="outline" onClick={toggleDarkMode}>
              {isDarkMode ? <Sun className="h-[1.2rem] w-[1.2rem]" /> : <Moon className="h-[1.2rem] w-[1.2rem]" />}
              <span className="sr-only">Toggle dark mode</span>
            </Button>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon">
                  <HelpCircle className="h-[1.2rem] w-[1.2rem]" />
                  <span className="sr-only">Help</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Click on the grid to add a new task. Drag tasks to reposition them.</p>
              </TooltipContent>
            </Tooltip>
            {isLoggedIn ? (
              <>
                <Button variant="outline" onClick={handleFetchTasks}>
                  <Microsoft className="w-4 h-4 mr-2" />
                  Import Tasks
                </Button>
                <Button variant="outline" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={handleLogin}>
                  <Microsoft className="w-4 h-4 mr-2" />
                  Login with Microsoft
                </Button>
                <Button variant="outline" onClick={handleLoginRetry}>
                  Retry Login
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue="grid" onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="grid">Grid</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="table">Table</TabsTrigger>
            </TabsList>
            <TabsContent value="grid">
              <div className="mb-4">
                <Select value={selectedProject || ""} onValueChange={(value) => setSelectedProject(value || null)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Projects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Projects</SelectItem> {/* Changed default value to "all" */}
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div
                className="relative w-full aspect-square md:aspect-[4/3] lg:aspect-square p-4 sm:p-8 bg-background text-foreground border rounded-lg"
                onClick={handleGridClick}
              >
                {/* Grid lines */}
                <div className="absolute inset-8 flex items-center justify-center">
                  <div className="w-[2px] h-full bg-muted-foreground" />
                  <div className="absolute w-full h-[2px] bg-muted-foreground" />
                </div>

                {/* Mesh Grid */}
                {gridConfig.showMeshGrid && (
                  <div className="absolute inset-8 grid grid-cols-4 grid-rows-4">
                    {Array.from({ length: 16 }).map((_, index) => (
                      <div key={index} className="border border-muted" />
                    ))}
                  </div>
                )}

                {/* Axis Labels */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                  <div className="text-center text-lg -mt-8 text-muted-foreground">{gridConfig.xAxisLabel} - High</div>
                  <div className="text-center text-lg -mb-8 text-muted-foreground">{gridConfig.xAxisLabel} - Low</div>
                </div>
                <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
                  <div className="text-lg absolute left-0 -translate-x-full pr-3 whitespace-nowrap text-muted-foreground rotate-90 origin-right">
                    {gridConfig.yAxisLabel} - High
                  </div>
                  <div className="text-lg absolute right-0 translate-x-full pl-3 whitespace-nowrap text-muted-foreground rotate-90 origin-left">
                    {gridConfig.yAxisLabel} - Low
                  </div>
                </div>

                {/* Quadrant Labels */}
                <div className="absolute inset-8 grid grid-cols-2 grid-rows-2 gap-4 pointer-events-none">
                  <div className="text-sm text-muted-foreground p-2">{gridConfig.quadrantLabels[0]}</div>
                  <div className="text-sm text-muted-foreground p-2 text-right">{gridConfig.quadrantLabels[1]}</div>
                  <div className="text-sm text-muted-foreground p-2 self-end">{gridConfig.quadrantLabels[2]}</div>
                  <div className="text-sm text-muted-foreground p-2 text-right self-end">
                    {gridConfig.quadrantLabels[3]}
                  </div>
                </div>

                {/* Tasks */}
                {filteredTasks.map((task) => (
                  <DraggableTask key={task.id} task={task} onDragEnd={handleTaskDragEnd} onClick={handleTaskClick} />
                ))}
              </div>
            </TabsContent>
            <TabsContent value="timeline">
              <div className="bg-background text-foreground border rounded-lg p-4">
                {tasks.length === 0 ? (
                  <p className="text-center text-muted-foreground">
                    No tasks added yet. Switch to the Grid view to add tasks.
                  </p>
                ) : (
                  <Timeline>
                    {Object.entries(groupTasksByProject()).map(([projectId, projectTasks]) => (
                      <React.Fragment key={projectId}>
                        <h3 className="text-lg font-semibold mt-4 mb-2">
                          {projectId === "unassigned" ? "Unassigned" : getProjectName(projectId)}
                        </h3>
                        {projectTasks.map((task) => (
                          <TimelineItem 
                            key={task.id}
                            title={task.title}
                            description={task.description}
                            date={task.createdAt.toLocaleString()}
                          />
                        ))}
                      </React.Fragment>
                    ))}
                  </Timeline>
                )}
              </div>
            </TabsContent>
            <TabsContent value="table">
              <div className="bg-background text-foreground border rounded-lg p-4 overflow-x-auto">
                {tasks.length === 0 ? (
                  <p className="text-center text-muted-foreground">
                    No tasks added yet. Switch to the Grid view to add tasks.
                  </p>
                ) : (
                  Object.entries(groupTasksByProject()).map(([projectId, projectTasks]) => (
                    <React.Fragment key={projectId}>
                      <h3 className="text-lg font-semibold mt-4 mb-2">
                        {projectId === "unassigned" ? "Unassigned" : getProjectName(projectId)}
                      </h3>
                      <Table className="w-full min-w-[640px]">
                        <TableHeader>
                          <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Urgency</TableHead>
                            <TableHead>Importance</TableHead>
                            <TableHead>Impact</TableHead>
                            <TableHead>Technical Debt</TableHead>
                            <TableHead>Created At</TableHead>
                            <TableHead>Source</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {projectTasks.map((task) => (
                            <TableRow key={task.id}>
                              <TableCell>{task.title}</TableCell>
                              <TableCell>{task.description}</TableCell>
                              <TableCell>{task.urgency}</TableCell>
                              <TableCell>{task.importance}</TableCell>
                              <TableCell>{task.impact}</TableCell>
                              <TableCell>{task.technicalDebt}</TableCell>
                              <TableCell>{task.createdAt.toLocaleString()}</TableCell>
                              <TableCell>{task.source}</TableCell>
                              <TableCell>
                                <Button variant="ghost" size="sm" onClick={() => handleTaskClick(task)}>
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDeleteTask(task.id)}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </React.Fragment>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Add Task Button (only visible in Grid view) */}
        {activeTab === "grid" && (
          <Button
            variant="default"
            size="lg"
            className="fixed bottom-8 right-8 rounded-full shadow-lg"
            onClick={() => {
              setEditingTask(null)
              setIsModalOpen(true)
            }}
          >
            <PlusCircle className="w-6 h-6 mr-2" />
            Add Task
          </Button>
        )}

        {/* Add/Edit Task Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingTask ? "Edit Task" : "Add New Task"}</DialogTitle>
              <DialogDescription>Enter the details for your task.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Title
                </Label>
                <Input
                  id="title"
                  value={editingTask ? editingTask.title : newTask.title}
                  onChange={(e) =>
                    editingTask
                      ? setEditingTask({ ...editingTask, title: e.target.value })
                      : setNewTask({ ...newTask, title: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={editingTask ? editingTask.description : newTask.description}
                  onChange={(e) =>
                    editingTask
                      ? setEditingTask({ ...editingTask, description: e.target.value })
                      : setNewTask({ ...newTask, description: e.target.value })
                  }
                  className="col-span3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="project" className="text-right">
                  Project
                </Label>
                <Select
                  value={editingTask ? editingTask.projectId : newTask.projectId}
                  onValueChange={(value) =>
                    editingTask
                      ? setEditingTask({ ...editingTask, projectId: value })
                      : setNewTask({ ...newTask, projectId: value })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="loopLink" className="text-right">
                  MS Loop Link
                </Label>
                <Input
                  id="loopLink"
                  value={editingTask ? editingTask.loopLink : newTask.loopLink}
                  onChange={(e) =>
                    editingTask
                      ? setEditingTask({ ...editingTask, loopLink: e.target.value })
                      : setNewTask({ ...newTask, loopLink: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="color" className="text-right">
                  Color
                </Label>
                <Input
                  id="color"
                  type="color"
                  value={editingTask ? editingTask.color : newTask.color}
                  onChange={(e) =>
                    editingTask
                      ? setEditingTask({ ...editingTask, color: e.target.value })
                      : setNewTask({ ...newTask, color: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="urgency" className="text-right">
                  Urgency
                </Label>
                <div className="col-span-3 flex items-center gap-2">
                  <Slider
                    id="urgency"
                    min={1}
                    max={10}
                    step={1}
                    value={[editingTask ? editingTask.urgency : newTask.urgency || 5]}
                    onValueChange={([value]) =>
                      editingTask
                        ? setEditingTask({ ...editingTask, urgency: value })
                        : setNewTask({ ...newTask, urgency: value })
                    }
                  />
                  <span>{editingTask ? editingTask.urgency : newTask.urgency}</span>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="importance" className="text-right">
                  Importance
                </Label>
                <div className="col-span-3 flex items-center gap-2">
                  <Slider
                    id="importance"
                    min={1}
                    max={10}
                    step={1}
                    value={[editingTask ? editingTask.importance : newTask.importance || 5]}
                    onValueChange={([value]) =>
                      editingTask
                        ? setEditingTask({ ...editingTask, importance: value })
                        : setNewTask({ ...newTask, importance: value })
                    }
                  />
                  <span>{editingTask ? editingTask.importance : newTask.importance}</span>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="impact" className="text-right">
                  Impact
                </Label>
                <div className="col-span-3 flex items-center gap-2">
                  <Slider
                    id="impact"
                    min={1}
                    max={10}
                    step={1}
                    value={[editingTask ? editingTask.impact : newTask.impact || 5]}
                    onValueChange={([value]) =>
                      editingTask
                        ? setEditingTask({ ...editingTask, impact: value })
                        : setNewTask({ ...newTask, impact: value })
                    }
                  />
                  <span>{editingTask ? editingTask.impact : newTask.impact}</span>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="technicalDebt" className="text-right">
                  Technical Debt
                </Label>
                <div className="col-span-3 flex items-center gap-2">
                  <Slider
                    id="technicalDebt"
                    min={1}
                    max={10}
                    step={1}
                    value={[editingTask ? editingTask.technicalDebt : newTask.technicalDebt || 5]}
                    onValueChange={([value]) =>
                      editingTask
                        ? setEditingTask({ ...editingTask, technicalDebt: value })
                        : setNewTask({ ...newTask, technicalDebt: value })
                    }
                  />
                  <span>{editingTask ? editingTask.technicalDebt : newTask.technicalDebt}</span>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="screenshot" className="text-right">
                  Screenshot
                </Label>
                <Input
                  id="screenshot"
                  type="file"
                  accept="image/*"
                  onChange={handleScreenshotUpload}
                  className="col-span-3"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={editingTask ? handleUpdateTask : handleAddTask}>
                {editingTask ? "Update Task" : "Add Task"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add/Edit Project Modal */}
        <Dialog open={isProjectModalOpen} onOpenChange={setIsProjectModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingProject ? "Edit Project" : "Add New Project"}</DialogTitle>
              <DialogDescription>Enter the details for your project.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="projectName" className="text-right">
                  Project Name
                </Label>
                <Input
                  id="projectName"
                  value={editingProject ? editingProject.name : newProject.name}
                  onChange={(e) =>
                    editingProject
                      ? setEditingProject({ ...editingProject, name: e.target.value })
                      : setNewProject({ ...newProject, name: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="projectColor" className="text-right">
                  Color
                </Label>
                <Input
                  id="projectColor"
                  type="color"
                  value={editingProject ? editingProject.color : newProject.color}
                  onChange={(e) =>
                    editingProject
                      ? setEditingProject({ ...editingProject, color: e.target.value })
                      : setNewProject({ ...newProject, color: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={editingProject ? handleUpdateProject : handleAddProject}>
                {editingProject ? "Update Project" : "Add Project"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Project Button */}
        <Button
          variant="outline"
          size="sm"
          className="fixed bottom-8 left-8 rounded-full shadow-lg"
          onClick={() => {
            setEditingProject(null)
            setIsProjectModalOpen(true)
          }}
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Add Project
        </Button>

        {/* Import Tasks Modal */}
        <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Import Tasks</DialogTitle>
              <DialogDescription>Select tasks to import from O365, Outlook, and Dynamics.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
              <h3 className="text-lg font-semibold">O365 Tasks</h3>
              {o365Tasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between">
                  <span>{task.title}</span>
                  <Button onClick={() => handleImportTask(task, "o365")}>Import</Button>
                </div>
              ))}
              <h3 className="text-lg font-semibold mt-4">Outlook Tasks</h3>
              {outlookTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between">
                  <span>{task.subject}</span>
                  <Button onClick={() => handleImportTask(task, "outlook")}>Import</Button>
                </div>
              ))}
              <h3 className="text-lg font-semibold mt-4">Dynamics Tasks</h3>
              {dynamicsTasks.map((task) => (
                <div key={task.activityid} className="flex items-center justify-between">
                  <span>{task.subject}</span>
                  <Button onClick={() => handleImportTask(task, "dynamics")}>Import</Button>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setIsImportModalOpen(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}

