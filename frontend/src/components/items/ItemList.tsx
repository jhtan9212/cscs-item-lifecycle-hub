import type { Item } from "@/types/item"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { usePermissions } from "@/hooks/usePermissions"
import { Plus, Edit, Trash2 } from "lucide-react"

interface ItemListProps {
  items: Item[]
  onEdit: (item: Item) => void
  onDelete: (itemId: string) => void
  onCreateNew: () => void
}

export const ItemList = ({ items, onEdit, onDelete, onCreateNew }: ItemListProps) => {
  const { hasPermission } = usePermissions()
  const canCreate = hasPermission("CREATE_ITEM")
  const canUpdate = hasPermission("UPDATE_ITEM")
  const canDelete = hasPermission("DELETE_ITEM")

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Items</h3>
        {canCreate && (
          <Button onClick={onCreateNew} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No items found</p>
            {canCreate && (
              <Button onClick={onCreateNew} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Create First Item
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 space-y-2">
                    <h4 className="font-semibold">{item.name}</h4>
                    {item.description && (
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    )}
                    {item.category && (
                      <Badge variant="outline" className="text-xs">
                        {item.category}
                      </Badge>
                    )}
                  </div>
                  {(canUpdate || canDelete) && (
                    <div className="flex gap-2 shrink-0">
                      {canUpdate && (
                        <Button onClick={() => onEdit(item)} size="sm" variant="outline">
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                      )}
                      {canDelete && (
                        <Button onClick={() => onDelete(item.id)} size="sm" variant="destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
