import { Bell, Briefcase, Building2, CalendarX2, Users } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import Badge, { type BadgeVariant } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";

const stats = [
  { label: "Total employees", value: "128", Icon: Users },
  { label: "Departments", value: "6", Icon: Building2 },
  { label: "Pending leave requests", value: "12", Icon: CalendarX2 },
  { label: "Open positions", value: "4", Icon: Briefcase },
];

type EmployeeRow = {
  name: string;
  position: string;
  department: string;
  status: "Active" | "On leave" | "Notice period";
};

const employees: EmployeeRow[] = [
  {
    name: "Anshul Gusain",
    position: "Frontend Developer",
    department: "Engineering",
    status: "Active",
  },
  {
    name: "Vishal Rawat",
    position: "Backend Developer",
    department: "Engineering",
    status: "Active",
  },
  {
    name: "Priya Sharma",
    position: "HR Executive",
    department: "People Ops",
    status: "On leave",
  },
  {
    name: "Rahul Verma",
    position: "Accountant",
    department: "Finance",
    status: "Notice period",
  },
];

const statusVariants: Record<EmployeeRow["status"], BadgeVariant> = {
  Active: "success",
  "On leave": "warning",
  "Notice period": "danger",
};

export default function DashboardPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-sans text-2xl font-bold">Dashboard</h1>
        <Button>Add employee</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, Icon }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-4 pt-5">
              <span className="rounded-lg bg-theme/10 p-3 text-theme">
                <Icon className="h-5 w-5" />
              </span>
              <span>
                <p className="text-sm text-secondary">{label}</p>
                <p className="font-sans text-2xl font-bold">{value}</p>
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent employees</CardTitle>
          <CardDescription>Newest members across departments</CardDescription>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <Table>
            <THead>
              <TR>
                <TH>Employee</TH>
                <TH>Position</TH>
                <TH>Department</TH>
                <TH>Status</TH>
              </TR>
            </THead>
            <TBody>
              {employees.map((employee) => (
                <TR key={employee.name}>
                  <TD>
                    <span className="flex items-center gap-3">
                      <Avatar name={employee.name} size="sm" />
                      <span className="font-medium">{employee.name}</span>
                    </span>
                  </TD>
                  <TD>{employee.position}</TD>
                  <TD>{employee.department}</TD>
                  <TD>
                    <Badge variant={statusVariants[employee.status]}>{employee.status}</Badge>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={<Bell className="h-8 w-8" />}
            title="No notifications"
            description="Updates about approvals, requests and announcements will appear here."
            action={
              <Button variant="outline" size="sm">
                Refresh
              </Button>
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
