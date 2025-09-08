import { useState } from "react"
import { MoreHorizontal, Search, Filter, Download, Plus, Save, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { Guardrail } from '@/types'
import { useGuardrails } from './lib/useGuardrails'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: number | string
  info?: string
  variant?: 'default' | 'success' | 'warning' | 'destructive'
}

function StatCard({ title, value, info, variant = 'default' }: StatCardProps) {
  const getValueColor = () => {
    switch (variant) {
      case 'success': return 'text-green-600'
      case 'warning': return 'text-orange-600'
      case 'destructive': return 'text-red-600'
      default: return 'text-foreground'
    }
  }

  return (
    <Card className={cn("shadow-none bg-transparent")}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              {info ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="text-[13px] font-450 text-muted-foreground border-b border-dashed border-gray-300 hover:text-foreground transition-colors cursor-help">
                        {title}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">{info}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <p className="text-[13px] font-450 text-muted-foreground border-b border-dashed border-gray-300">{title}</p>
              )}
            </div>
            <p className={cn("text-lg font-450", getValueColor())}>{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function Guardrails() {
  const { 
    guardrails, 
    addGuardrail, 
    updateGuardrail,
    deleteGuardrail, 
    toggleGuardrailStatus 
  } = useGuardrails()
  
  const [isAddingGuardrail, setIsAddingGuardrail] = useState(false)
  const [isEditingGuardrail, setIsEditingGuardrail] = useState(false)

  const [editingGuardrail, setEditingGuardrail] = useState<Guardrail | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    content: "",
    category: ""
  })
  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
    content: "",
    category: ""
  })

  const itemsPerPage = 10
  const filteredGuardrails = guardrails.filter(Guardrail =>
    Guardrail.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    Guardrail.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    Guardrail.category?.toLowerCase().includes(searchTerm.toLowerCase())
  )
  const totalPages = Math.ceil(filteredGuardrails.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = Math.min(startIndex + itemsPerPage, filteredGuardrails.length)
  const currentData = filteredGuardrails.slice(startIndex, endIndex)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newGuardrail: Guardrail = {
      id: Date.now().toString(),
      name: formData.name,
      description: formData.description,
      content: formData.content,
      category: formData.category || undefined,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      status: "active"
    }
    
    addGuardrail(newGuardrail)
    setFormData({ name: "", description: "", content: "", category: "" })
    setIsAddingGuardrail(false)
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingGuardrail) {
      updateGuardrail(editingGuardrail.id, {
        name: editFormData.name,
        description: editFormData.description,
        content: editFormData.content,
        category: editFormData.category || undefined
      })
      setEditFormData({ name: "", description: "", content: "", category: "" })
      setEditingGuardrail(null)
      setIsEditingGuardrail(false)
    }
  }

  const handleEdit = (Guardrail: Guardrail) => {
    setEditingGuardrail(Guardrail)
    setEditFormData({
      name: Guardrail.name,
      description: Guardrail.description,
      content: Guardrail.content,
      category: Guardrail.category || ""
    })
    setIsEditingGuardrail(true)
  }

  const handleDelete = (id: string) => {
    deleteGuardrail(id)
  }

  const toggleStatus = (id: string) => {
    toggleGuardrailStatus(id)
  }

  const handleViewGuardrail = (_Guardrail: Guardrail) => {
    // View guardrail functionality handled by Sheet component
  }

  const resetForm = () => {
    setFormData({ name: "", description: "", content: "", category: "" })
  }

  const resetEditForm = () => {
    setEditFormData({ name: "", description: "", content: "", category: "" })
    setEditingGuardrail(null)
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto">
        <div className="space-y-4">
          {/* Page Header */}
          <div className="px-6">
            <div className="flex items-center justify-between my-4">
              <h1 className="text-lg font-450 tracking-tight">Guardrails</h1>
              <Sheet open={isAddingGuardrail} onOpenChange={setIsAddingGuardrail}>
                <SheetTrigger asChild>
                  <Button size="default" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Plus className="mr-1 h-4 w-4" />
                    Create Guardrail
                  </Button>
                </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Create New Guardrail</SheetTitle>
                <SheetDescription>
                  Define a new Guardrail to ensure your AI systems follow specific rules and guidelines.
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-4 mt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter Guardrail name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category (Optional)</Label>
                      <Input
                        id="category"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        placeholder="e.g., Safety, Privacy, Compliance"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Brief description of the Guardrail"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="content">Guardrail Content</Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="Enter the detailed Guardrail rules and content..."
                      className="min-h-[120px]"
                      required
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button type="submit" className="flex-1">
                      <Save className="mr-2 h-4 w-4" />
                      Create Guardrail
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsAddingGuardrail(false)
                        resetForm()
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Edit Guardrail Sheet */}
        <Sheet open={isEditingGuardrail} onOpenChange={setIsEditingGuardrail}>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Edit Guardrail</SheetTitle>
              <SheetDescription>
                Update the Guardrail configuration and rules.
              </SheetDescription>
            </SheetHeader>
            <div className="space-y-4 mt-6">
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Name</Label>
                    <Input
                      id="edit-name"
                      value={editFormData.name}
                      onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                      placeholder="Enter Guardrail name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-category">Category (Optional)</Label>
                    <Input
                      id="edit-category"
                      value={editFormData.category}
                      onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                      placeholder="e.g., Safety, Privacy, Compliance"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Input
                    id="edit-description"
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                    placeholder="Brief description of the Guardrail"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-content">Guardrail Content</Label>
                  <Textarea
                    id="edit-content"
                    value={editFormData.content}
                    onChange={(e) => setEditFormData({ ...editFormData, content: e.target.value })}
                    placeholder="Enter the detailed Guardrail rules and content..."
                    className="min-h-[120px]"
                    required
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    <Save className="mr-2 h-4 w-4" />
                    Update Guardrail
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditingGuardrail(false)
                      resetEditForm()
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </SheetContent>
        </Sheet>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-6">
              <StatCard 
                title="Total Guardrails" 
                value={guardrails.length}
                info="Total number of content guardrails configured in your system. These policies help ensure your AI systems follow specific rules and guidelines."
                variant="default"
              />
              <StatCard 
                title="Active Guardrails" 
                value={guardrails.filter(g => g.status === 'active').length}
                info="Guardrails that are currently active and being enforced. These policies are actively protecting your AI systems from harmful or inappropriate content."
                variant="success"
              />
              <StatCard 
                title="Categories" 
                value={new Set(guardrails.map(g => g.category).filter(Boolean)).size}
                info="Number of distinct categories used to organize your guardrails. Categories help you manage and apply policies systematically across different use cases."
                variant="default"
              />
              <StatCard 
                title="Last Added" 
                value={guardrails.length > 0 ? guardrails[guardrails.length - 1].createdAt : 'N/A'}
                info="Date when the most recent guardrail was added to your system. Keep track of when new policies were configured."
                variant="default"
              />
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center justify-between px-6">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search guardrails..."
                  className="pl-8 w-[300px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                Edit Columns
              </Button>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="border-t border-b">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="pl-6">Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="pr-6"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentData.map((Guardrail) => (
                  <TableRow key={Guardrail.id}>
                    <TableCell className="font-450">
                      <span className="text-[13px] font-450 hover:underline cursor-pointer">
                        {Guardrail.name}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[300px] truncate">
                      {Guardrail.description}
                    </TableCell>
                    <TableCell className="text-sm">
                      {Guardrail.category ? (
                        <Badge variant="outline">{Guardrail.category}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      <Badge 
                        variant={Guardrail.status === 'active' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {Guardrail.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {Guardrail.createdAt}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Sheet>
                          <SheetTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewGuardrail(Guardrail)}
                            >
                              View
                            </Button>
                          </SheetTrigger>
                          <SheetContent>
                            <SheetHeader>
                              <SheetTitle>{Guardrail.name}</SheetTitle>
                              <SheetDescription>
                                {Guardrail.description}
                              </SheetDescription>
                            </SheetHeader>
                            <div className="space-y-4 mt-6">
                              <div className="space-y-2">
                                <Label className="text-sm font-450">Category</Label>
                                <div>
                                  {Guardrail.category ? (
                                    <Badge variant="outline">{Guardrail.category}</Badge>
                                  ) : (
                                    <span className="text-muted-foreground">No category assigned</span>
                                  )}
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-450">Status</Label>
                                <div>
                                  <Badge 
                                    variant={Guardrail.status === 'active' ? 'default' : 'secondary'}
                                  >
                                    {Guardrail.status}
                                  </Badge>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-450">Content</Label>
                                <div className="p-3 bg-muted rounded-md text-sm">
                                  {Guardrail.content}
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <Label className="text-xs text-muted-foreground">Created</Label>
                                  <div>{Guardrail.createdAt}</div>
                                </div>
                                <div>
                                  <Label className="text-xs text-muted-foreground">Last Updated</Label>
                                  <div>{Guardrail.updatedAt}</div>
                                </div>
                              </div>
                            </div>
                          </SheetContent>
                        </Sheet>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">More options</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(Guardrail)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toggleStatus(Guardrail.id)}>
                              {Guardrail.status === 'active' ? 'Deactivate' : 'Activate'}
                            </DropdownMenuItem>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem className="text-destructive">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Guardrail</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{Guardrail.name}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(Guardrail.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6">
            <p className="text-[13px] text-muted-foreground">
              Rows per page: {itemsPerPage}
            </p>
            <div className="flex items-center space-x-2">
              <p className="text-[13px] text-muted-foreground">
                {startIndex + 1} - {endIndex} of {filteredGuardrails.length}
              </p>
              <div className="flex items-center space-x-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
