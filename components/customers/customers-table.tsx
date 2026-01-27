"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Phone,
  MapPin,
  Building2,
  Briefcase,
  UserCheck,
  Users,
} from "lucide-react"
import { PersonsService } from "@/services/contacts-service"
import { PersonForm } from "./person-form"
import { UniversalTable, ColumnDef, FilterDef, UniversalTableProps } from "@/components/shared/universal-table"

const groupColors: Record<string, string> = {
  Corporate: "bg-blue-100 text-blue-700 border-blue-200",
  SME: "bg-green-100 text-green-700 border-green-200",
  Startup: "bg-purple-100 text-purple-700 border-purple-200",
  Retail: "bg-orange-100 text-orange-700 border-orange-200",
  Wholesale: "bg-cyan-100 text-cyan-700 border-cyan-200",
}

const statusColors: Record<string, string> = {
  Sold: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Prospect: "bg-amber-100 text-amber-700 border-amber-200",
}

// Adapter to match ServiceInterface
const personsServiceAdapter = {
  getCollection: (params: any) => PersonsService.getPersons(params),
  search: (query: string, params: any) => PersonsService.searchPersons(query, params),
  delete: (id: string | number) => PersonsService.deletePerson(id),
}

// Wrapper to adapt PersonForm props
const PersonFormWrapper = ({ initialData, onSuccess, onCancel }: any) => (
  <PersonForm person={initialData} onSuccess={onSuccess} onCancel={onCancel} />
)

export function CustomersTable() {

  // --- Configuration ---

  const columns: ColumnDef<any>[] = [
    { key: "owner", header: "Owner", className: "font-medium" },
    {
      key: "company",
      header: "Company",
      render: (item) => (
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span>{item.company}</span>
        </div>
      )
    },
    {
      key: "industry",
      header: "Industry",
      render: (item) => item.industry || <span className="text-muted-foreground">-</span>
    },
    {
      key: "number",
      header: "Contact", // Renamed from Contact to Contact (same, but ensures list consistency)
      render: (item) => (
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-mono">{item.number}</span>
        </div>
      )
    },
    {
      key: "location",
      header: "Location",
      render: (item) => (
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span>{item.location}</span>
        </div>
      )
    },
    {
      key: "group",
      header: "Group",
      render: (item) => (
        <Badge variant="outline" className={groupColors[item.group] || ""}>
          {item.group}
        </Badge>
      )
    },
    {
      key: "assignedTo",
      header: "Assigned To",
      render: (item) => item.assignedTo ? (
        <span className="text-sm">{item.assignedTo}</span>
      ) : (
        <span className="text-sm text-muted-foreground italic">Unassigned</span>
      )
    },
    {
      key: "status",
      header: "Status",
      render: (item) => (
        <Badge variant="outline" className={statusColors[item.status] || ""}>
          {item.status}
        </Badge>
      )
    },
    {
      key: "added",
      header: "Date Added",
      className: "text-sm text-muted-foreground",
      render: (item) => new Date(item.added).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    }
  ]

  const filters: FilterDef[] = [
    { key: "location", label: "Location", options: ["Karachi", "Lahore", "Islamabad", "Faisalabad", "Multan", "Quetta"].map(v => ({ label: v, value: v })) },
    { key: "group", label: "Group", options: ["Corporate", "SME", "Startup", "Retail", "Wholesale"].map(v => ({ label: v, value: v })) },
    { key: "status", label: "Status", options: [{ label: "Sold", value: "Sold" }, { label: "Prospect", value: "Prospect" }] },
    { key: "assignment", label: "Assignment", options: [{ label: "Assigned", value: "assigned" }, { label: "Unassigned", value: "unassigned" }] }
  ]

  const dataMapper = (p: any) => ({
    id: p.id,
    owner: p.name || 'Unknown',
    company: p.organization?.name || p.organization_name || 'N/A',
    industry: p.organization?.industry || 'Technology', // Fallback placeholder as industry is not yet in schema
    assignedTo: p.sales_owner?.name || p.sales_owner_name || '',
    number: p.contact_numbers?.[0]?.value || p.phone || '-',
    jobTitle: p.job_title || 'N/A',
    location: 'Unknown',
    group: 'SME',
    added: p.created_at || new Date().toISOString(),
    status: 'Prospect',
    original: p // Keep original object for editing
  })

  // Custom client filter logic
  const clientFilter = (customer: any, searchQuery: string, activeFilters: Record<string, string>) => {
    // 1. Search Query
    const searchLower = searchQuery.toLowerCase()
    const matchesSearch =
      searchQuery === "" ||
      customer.owner.toLowerCase().includes(searchLower) ||
      customer.company.toLowerCase().includes(searchLower) ||
      customer.jobTitle.toLowerCase().includes(searchLower) ||
      customer.number.includes(searchQuery)

    if (!matchesSearch) return false

    // 2. Assignment Filter (Special Case)
    const assignmentFilter = activeFilters["assignment"] || "all"
    if (assignmentFilter === "assigned" && customer.assignedTo === "") return false
    if (assignmentFilter === "unassigned" && customer.assignedTo !== "") return false

    // 3. Status Filter (already handled by generic filter but redundancy is fine)

    return true
  }

  // --- Renderers ---

  const renderStats = (data: any[]) => {
    const assignedCount = data.filter((c) => c.assignedTo !== "").length
    const unassignedCount = data.filter((c) => c.assignedTo === "").length
    const soldCount = data.filter((c) => c.status === "Sold").length
    const prospectCount = data.filter((c) => c.status === "Prospect").length

    return (
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              Assigned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Unassigned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unassignedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Sold</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{soldCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Prospects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{prospectCount}</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderCard = (customer: any, actions: React.ReactNode) => (
    <Card className="hover:shadow-md transition-shadow h-full">
      <CardContent className="p-4 flex flex-col h-full justify-between">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate">{customer.owner}</h3>
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                <Building2 className="h-4 w-4" />
                <span className="truncate">{customer.company}</span>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Badge variant="outline" className={groupColors[customer.group]}>{customer.group}</Badge>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 my-2">
            <Badge variant="outline" className={statusColors[customer.status]}>{customer.status}</Badge>
          </div>

          <div className="grid gap-1 text-sm text-muted-foreground">
            <div className="flex items-center gap-2"><Briefcase className="h-3.5 w-3.5" /><span className="truncate">{customer.jobTitle}</span></div>
            <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /><span className="font-mono">{customer.number}</span></div>
            <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5" /><span>{customer.location}</span></div>
            {customer.assignedTo ? (
              <div className="flex items-center gap-2"><UserCheck className="h-3.5 w-3.5" /><span>{customer.assignedTo}</span></div>
            ) : (
              <div className="text-muted-foreground italic">Unassigned</div>
            )}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t">
          {actions}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <UniversalTable
      title="Customers"
      description="Manage and view all customer accounts"
      endpoint="/contacts/persons"
      service={personsServiceAdapter}
      columns={columns}
      filters={filters}
      FormComponent={PersonFormWrapper}
      dataMapper={dataMapper}
      clientFilter={clientFilter}
      renderStats={renderStats}
      renderCard={renderCard}
      searchPlaceholder="Search customers..."
    />
  )
}

