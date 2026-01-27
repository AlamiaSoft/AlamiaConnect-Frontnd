"use client"

import { useMemo, useState } from "react"
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
} from "@dnd-kit/core"
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { createPortal } from "react-dom"

// --- Helper to get nested value ---
const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj)
}

// --- Sortable Item Component ---
interface KanbanItemProps {
    id: string | number
    item: any
    renderCard: (item: any) => React.ReactNode
}

function KanbanItem({ id, item, renderCard }: KanbanItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    }

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="mb-3 cursor-grab active:cursor-grabbing">
            {renderCard(item)}
        </div>
    )
}

// --- Droppable Column Component ---
interface KanbanColumnProps {
    id: string
    title: string
    items: any[]
    renderCard: (item: any) => React.ReactNode
    color?: string
}

function KanbanColumn({ id, title, items, renderCard, color }: KanbanColumnProps) {
    const { setNodeRef } = useSortable({
        id: id,
        data: {
            type: "Column",
            items,
        },
    })

    return (
        <div ref={setNodeRef} className="flex flex-col w-80 shrink-0 h-full max-h-full bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800 flex-none mr-4">
            <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-inherit rounded-t-lg z-10">
                <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${color || 'bg-slate-400'}`} />
                    <h3 className="font-semibold text-sm">{title}</h3>
                    <Badge variant="secondary" className="ml-2 text-xs font-normal">
                        {items.length}
                    </Badge>
                </div>
            </div>
            <ScrollArea className="flex-1 p-3">
                <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                    {items.map((item) => (
                        <KanbanItem key={item.id} id={item.id} item={item} renderCard={renderCard} />
                    ))}
                </SortableContext>
            </ScrollArea>
        </div>
    )
}

// --- Main Board Component ---
export interface KanbanBoardProps<T> {
    items: T[]
    groupBy: string
    columns?: { id: string; label: string; color?: string }[]
    renderCard: (item: T) => React.ReactNode
    onStatusChange?: (itemId: string | number, newStatusId: string) => void
    isLoading?: boolean
}

export function KanbanBoard<T extends { id: string | number }>({
    items,
    groupBy,
    columns = [],
    renderCard,
    onStatusChange,
    isLoading
}: KanbanBoardProps<T>) {
    const [activeId, setActiveId] = useState<string | number | null>(null)

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // Prevent drag on simple clicks
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    // Group items by status
    const groupedData = useMemo(() => {
        const groups: Record<string, T[]> = {}

        // Initialize groups from defined columns
        columns.forEach(col => {
            groups[col.id] = []
        })

        // Distribute items
        items.forEach(item => {
            const groupKey = getNestedValue(item, groupBy) || 'Unassigned'
            // Match groupKey to column ID. 
            // Often api returns { stage: { id: 1, name: 'New' } } and we groupBy 'stage.id'
            // We need to ensure types match (string vs number)
            const matchedCol = columns.find(c => c.id.toString() === groupKey?.toString())
            const key = matchedCol ? matchedCol.id : (columns.length > 0 ? columns[0].id : 'Unassigned')

            if (!groups[key]) groups[key] = []
            groups[key].push(item)
        })

        return groups
    }, [items, groupBy, columns])

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id)
    }

    const handleDragOver = (event: DragOverEvent) => {
        // Optional: Could implement reordering logic here for smoother UX
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event

        setActiveId(null)

        if (!over) return

        const activeItem = items.find(i => i.id === active.id)
        if (!activeItem) return

        // Find which column we dropped into
        // If dropped on a container (column)
        let overId = over.id

        // If dropped on an item, find that item's column
        if (active.id !== over.id) {
            // We need to find which column holds the 'over' item
            // checking data.sortable is unreliable across containers sometimes
        }

        // Simplification: We rely on the container ID being the status ID
        // But dnd-kit SortableContext uses item IDs.
        // We need robust detection of the target column.

        // Let's use the `over.data.current.sortable.containerId` if available
        const overContainerId = over.data.current?.sortable?.containerId || over.id

        // Check if overContainerId matches a known column ID
        const targetColumn = columns.find(c => c.id.toString() === overContainerId?.toString())

        if (targetColumn) {
            const currentGroup = getNestedValue(activeItem, groupBy)

            // Only update if status changed
            if (currentGroup?.toString() !== targetColumn.id.toString()) {
                onStatusChange?.(activeItem.id, targetColumn.id)
            }
        }
    }

    if (isLoading) {
        return <div className="p-10 text-center text-muted-foreground">Loading board...</div>
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className="flex h-full overflow-x-auto pb-4">
                {columns.map((col) => (
                    <KanbanColumn
                        key={col.id}
                        id={col.id}
                        title={col.label}
                        items={groupedData[col.id] || []}
                        renderCard={renderCard}
                        color={col.color}
                    />
                ))}
            </div>

            {createPortal(
                <DragOverlay>
                    {activeId ? (
                        <div className="opacity-80 rotate-2 cursor-grabbing">
                            {/* Re-render the card for the active item */}
                            {(() => {
                                const item = items.find(i => i.id === activeId)
                                return item ? renderCard(item) : null
                            })()}
                        </div>
                    ) : null}
                </DragOverlay>,
                document.body
            )}
        </DndContext>
    )
}
