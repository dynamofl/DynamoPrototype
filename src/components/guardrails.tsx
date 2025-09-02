import { useState } from "react"
import { MoreHorizontal, Search, Filter, Download, Plus, X, Save, Eye, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
import type { Guardrail } from '@/types'
import { useGuardrails } from '@/lib/useGuardrails'

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
  const [selectedGuardrail, setSelectedGuardrail] = useState<Guardrail | null>(null)
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
  const filteredGuardrails = guardrails.filter(guardrail =>
    guardrail.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guardrail.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guardrail.category?.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleEdit = (guardrail: Guardrail) => {
    setEditingGuardrail(guardrail)
    setEditFormData({
      name: guardrail.name,
      description: guardrail.description,
      content: guardrail.content,
      category: guardrail.category || ""
    })
    setIsEditingGuardrail(true)
  }

  const handleDelete = (id: string) => {
    deleteGuardrail(id)
  }

  const toggleStatus = (id: string) => {
    toggleGuardrailStatus(id)
  }

  const handleViewGuardrail = (guardrail: Guardrail) => {
    setSelectedGuardrail(guardrail)
  }

  const resetForm = () => {
    setFormData({ name: "", description: "", content: "", category: "" })
  }

  const resetEditForm = () => {
    setEditFormData({ name: "", description: "", content: "", category: "" })
    setEditingGuardrail(null)
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Guardrails</h1>
            <p className="text-muted-foreground">
              Create and manage content guardrails for your AI systems
            </p>
          </div>
          <Sheet open={isAddingGuardrail} onOpenChange={setIsAddingGuardrail}>
            <SheetTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Guardrail
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Create New Guardrail</SheetTitle>
                <SheetDescription>
                  Define a new guardrail to ensure your AI systems follow specific rules and guidelines.
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
                        placeholder="Enter guardrail name"
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
                      placeholder="Brief description of the guardrail"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="content">Guardrail Content</Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="Enter the detailed guardrail rules and content..."
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
                Update the guardrail configuration and rules.
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
                      placeholder="Enter guardrail name"
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
                    placeholder="Brief description of the guardrail"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-content">Guardrail Content</Label>
                  <Textarea
                    id="edit-content"
                    value={editFormData.content}
                    onChange={(e) => setEditFormData({ ...editFormData, content: e.target.value })}
                    placeholder="Enter the detailed guardrail rules and content..."
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Guardrails</CardTitle>
              <div className="h-4 w-4 text-muted-foreground">🛡️</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{guardrails.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Guardrails</CardTitle>
              <div className="h-4 w-4 text-green-600">✅</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {guardrails.filter(g => g.status === 'active').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <div className="h-4 w-4 text-muted-foreground">🏷️</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(guardrails.map(g => g.category).filter(Boolean)).size}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Added</CardTitle>
              <div className="h-4 w-4 text-muted-foreground">🕒</div>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                {guardrails.length > 0 ? guardrails[guardrails.length - 1].createdAt : 'N/A'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Header Actions */}
        <div className="flex items-center justify-between">
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

        {/* Guardrails Table */}
        <Card>
          <CardHeader>
            <CardTitle>Guardrail List</CardTitle>
            <CardDescription>
              Manage your content guardrails. Click View to see details or use the actions menu for more options.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentData.map((guardrail) => (
                  <TableRow key={guardrail.id}>
                    <TableCell className="font-medium">
                      <span className="text-[13px] font-450 hover:underline cursor-pointer">
                        {guardrail.name}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[300px] truncate">
                      {guardrail.description}
                    </TableCell>
                    <TableCell>
                      {guardrail.category ? (
                        <Badge variant="outline">{guardrail.category}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={guardrail.status === 'active' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {guardrail.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {guardrail.createdAt}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Sheet>
                          <SheetTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewGuardrail(guardrail)}
                            >
                              <Eye className="mr-1 h-3 w-3" />
                              View
                            </Button>
                          </SheetTrigger>
                          <SheetContent>
                            <SheetHeader>
                              <SheetTitle>{guardrail.name}</SheetTitle>
                              <SheetDescription>
                                {guardrail.description}
                              </SheetDescription>
                            </SheetHeader>
                            <div className="space-y-4 mt-6">
                              <div className="space-y-2">
                                <Label className="text-sm font-medium">Category</Label>
                                <div>
                                  {guardrail.category ? (
                                    <Badge variant="outline">{guardrail.category}</Badge>
                                  ) : (
                                    <span className="text-muted-foreground">No category assigned</span>
                                  )}
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-medium">Status</Label>
                                <div>
                                  <Badge 
                                    variant={guardrail.status === 'active' ? 'default' : 'secondary'}
                                  >
                                    {guardrail.status}
                                  </Badge>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-medium">Content</Label>
                                <div className="p-3 bg-muted rounded-md text-sm">
                                  {guardrail.content}
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <Label className="text-xs text-muted-foreground">Created</Label>
                                  <div>{guardrail.createdAt}</div>
                                </div>
                                <div>
                                  <Label className="text-xs text-muted-foreground">Last Updated</Label>
                                  <div>{guardrail.updatedAt}</div>
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
                            <DropdownMenuItem onClick={() => handleEdit(guardrail)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toggleStatus(guardrail.id)}>
                              {guardrail.status === 'active' ? 'Deactivate' : 'Activate'}
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
                                    Are you sure you want to delete "{guardrail.name}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(guardrail.id)}
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
          </CardContent>
        </Card>

        {/* Pagination */}
        <div className="flex items-center justify-between">
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
    </div>
  )
}
