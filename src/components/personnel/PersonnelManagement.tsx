import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Plus, Pencil, Trash2, Users, UserCheck, Building2, ClipboardList, Truck, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  useAgents,
  useAccountManagers,
  useClients,
  useSolutionManagers,
  useDeliveryManagers,
  useAgentMutations,
  useAccountManagerMutations,
  useClientMutations,
  useSolutionManagerMutations,
  useDeliveryManagerMutations,
} from '@/hooks/usePersonnel';
import type { Agent, AccountManager, Client, SolutionManager, DeliveryManager } from '@/types/personnel';

// Generic CRUD table for name/email entities
function SimplePersonnelCRUD<T extends { id: string; name: string; email?: string | null; is_active: boolean }>({
  title,
  icon: Icon,
  data = [],
  isLoading,
  mutations,
  queryKey,
}: {
  title: string;
  icon: React.ElementType;
  data: T[];
  isLoading: boolean;
  mutations: { create: any; update: any; remove: any };
  queryKey: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isActive, setIsActive] = useState(true);

  const reset = () => {
    setEditing(null);
    setName('');
    setEmail('');
    setIsActive(true);
    setIsOpen(false);
  };

  const handleEdit = (row: T) => {
    setEditing(row);
    setName(row.name);
    setEmail(row.email || '');
    setIsActive(row.is_active);
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error('Name is required');
      return;
    }
    if (editing) {
      mutations.update.mutate(
        { id: editing.id, data: { name: trimmedName, email: email?.trim() || null, is_active: isActive } },
        {
          onSuccess: () => {
            toast.success('Updated successfully');
            reset();
          },
          onError: (err: Error) => toast.error(err.message),
        }
      );
    } else {
      mutations.create.mutate(
        { name: trimmedName, email: email?.trim() || undefined },
        {
          onSuccess: () => {
            toast.success('Added successfully');
            reset();
          },
          onError: (err: Error) => toast.error(err.message),
        }
      );
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    mutations.remove.mutate(id, {
      onSuccess: () => toast.success('Deleted'),
      onError: (err: Error) => toast.error(err.message),
    });
  };

  return (
    <Card>
      <CardHeader className="bg-primary text-primary-foreground py-3 px-4 rounded-t-lg">
        <CardTitle className="text-base flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4" />
            {title} ({data.length})
          </div>
          <Dialog open={isOpen} onOpenChange={(v) => { setIsOpen(v); if (!v) reset(); }}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => { reset(); setIsOpen(true); }}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editing ? `Edit ${title.slice(0, -1)}` : `Add ${title.slice(0, -1)}`}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                {editing && (
                  <div className="flex items-center gap-2">
                    <Switch checked={isActive} onCheckedChange={setIsActive} />
                    <Label>Active</Label>
                  </div>
                )}
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={reset}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={mutations.create.isPending || mutations.update.isPending}>
                    {editing ? 'Update' : 'Add'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : data.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No records. Click Add to create one.</div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell className="text-muted-foreground">{row.email || '—'}</TableCell>
                    <TableCell>
                      <span className={row.is_active ? 'text-green-600' : 'text-muted-foreground'}>
                        {row.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="icon" variant="ghost" onClick={() => handleEdit(row)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => handleDelete(row.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Clients CRUD (includes account_manager_id select)
function ClientsCRUD() {
  const { data: clients = [], isLoading } = useClients();
  const { data: accountManagers = [] } = useAccountManagers();
  const mutations = useClientMutations();
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [name, setName] = useState('');
  const [accountManagerId, setAccountManagerId] = useState<string>('');
  const [isActive, setIsActive] = useState(true);

  const reset = () => {
    setEditing(null);
    setName('');
    setAccountManagerId('');
    setIsActive(true);
    setIsOpen(false);
  };

  const handleEdit = (row: Client) => {
    setEditing(row);
    setName(row.name);
    setAccountManagerId(row.account_manager_id || '');
    setIsActive(row.is_active);
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error('Name is required');
      return;
    }
    const amId = accountManagerId || null;
    if (editing) {
      mutations.update.mutate(
        { id: editing.id, data: { name: trimmedName, account_manager_id: amId, is_active: isActive } },
        {
          onSuccess: () => {
            toast.success('Client updated');
            reset();
          },
          onError: (err: Error) => toast.error(err.message),
        }
      );
    } else {
      mutations.create.mutate(
        { name: trimmedName, account_manager_id: amId },
        {
          onSuccess: () => {
            toast.success('Client added');
            reset();
          },
          onError: (err: Error) => toast.error(err.message),
        }
      );
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure? This may affect lab and delivery requests.')) return;
    mutations.remove.mutate(id, {
      onSuccess: () => toast.success('Deleted'),
      onError: (err: Error) => toast.error(err.message),
    });
  };

  return (
    <Card>
      <CardHeader className="bg-primary text-primary-foreground py-3 px-4 rounded-t-lg">
        <CardTitle className="text-base flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Clients ({clients.length})
          </div>
          <Dialog open={isOpen} onOpenChange={(v) => { setIsOpen(v); if (!v) reset(); }}>
            <DialogTrigger asChild>
              <Button size="sm" variant="secondary" onClick={() => { reset(); setIsOpen(true); }}>
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editing ? 'Edit Client' : 'Add Client'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Account Manager</Label>
                  <Select value={accountManagerId} onValueChange={setAccountManagerId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select account manager (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {accountManagers.filter((am) => am.is_active).map((am) => (
                        <SelectItem key={am.id} value={am.id}>
                          {am.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {editing && (
                  <div className="flex items-center gap-2">
                    <Switch checked={isActive} onCheckedChange={setIsActive} />
                    <Label>Active</Label>
                  </div>
                )}
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={reset}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={mutations.create.isPending || mutations.update.isPending}>
                    {editing ? 'Update' : 'Add'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : clients.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No clients. Click Add to create one.</div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Account Manager</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell>
                      {accountManagers.find((am) => am.id === row.account_manager_id)?.name ?? '—'}
                    </TableCell>
                    <TableCell>
                      <span className={row.is_active ? 'text-green-600' : 'text-muted-foreground'}>
                        {row.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="icon" variant="ghost" onClick={() => handleEdit(row)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => handleDelete(row.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export const PersonnelManagement = () => {
  const { data: agents = [], isLoading: agentsLoading, isError: agentsError, error: agentsErrorDetail } = useAgents();
  const { data: accountManagers = [] } = useAccountManagers();
  const { data: solutionManagers = [] } = useSolutionManagers();
  const { data: deliveryManagers = [] } = useDeliveryManagers();

  const errMsg =
    agentsErrorDetail && typeof (agentsErrorDetail as { message?: string }).message === 'string'
      ? (agentsErrorDetail as { message: string }).message
      : '';
  const missingTablesHint =
    agentsError &&
    errMsg &&
    (errMsg.includes('does not exist') ||
      errMsg.includes('relation') ||
      /schema/i.test(errMsg));

  return (
    <div className="space-y-4">
      {missingTablesHint && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Database schema not set up</AlertTitle>
          <AlertDescription>
            Supabase needs the database tables first. In <strong>Supabase Dashboard → SQL Editor</strong>, run the
            script <code className="text-xs bg-muted px-1 rounded">supabase/RUN_PERSONNEL_MIGRATIONS.sql</code> from
            this project. That creates the personnel tables (agents, account managers, clients, etc.). If your project
            has no tables yet, run all migration files in <code className="text-xs bg-muted px-1 rounded">supabase/migrations/</code> in
            date order, then run <code className="text-xs bg-muted px-1 rounded">RUN_PERSONNEL_MIGRATIONS.sql</code>.
          </AlertDescription>
        </Alert>
      )}
      <Tabs defaultValue="agents" className="space-y-4">
      <TabsList>
        <TabsTrigger value="agents" className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          Agents
        </TabsTrigger>
        <TabsTrigger value="accountManagers" className="flex items-center gap-2">
          <UserCheck className="w-4 h-4" />
          Account Managers
        </TabsTrigger>
        <TabsTrigger value="clients" className="flex items-center gap-2">
          <Building2 className="w-4 h-4" />
          Clients
        </TabsTrigger>
        <TabsTrigger value="solutionManagers" className="flex items-center gap-2">
          <ClipboardList className="w-4 h-4" />
          Solution Managers
        </TabsTrigger>
        <TabsTrigger value="deliveryManagers" className="flex items-center gap-2">
          <Truck className="w-4 h-4" />
          Delivery Managers
        </TabsTrigger>
      </TabsList>

      <TabsContent value="agents">
        <SimplePersonnelCRUD
          title="Agents"
          icon={Users}
          data={agents}
          isLoading={agentsLoading}
          mutations={useAgentMutations()}
          queryKey="agents"
        />
      </TabsContent>

      <TabsContent value="accountManagers">
        <SimplePersonnelCRUD
          title="Account Managers"
          icon={UserCheck}
          data={accountManagers}
          isLoading={false}
          mutations={useAccountManagerMutations()}
          queryKey="accountManagers"
        />
      </TabsContent>

      <TabsContent value="clients">
        <ClientsCRUD />
      </TabsContent>

      <TabsContent value="solutionManagers">
        <SimplePersonnelCRUD
          title="Solution Managers"
          icon={ClipboardList}
          data={solutionManagers}
          isLoading={false}
          mutations={useSolutionManagerMutations()}
          queryKey="solutionManagers"
        />
      </TabsContent>

      <TabsContent value="deliveryManagers">
        <SimplePersonnelCRUD
          title="Delivery Managers"
          icon={Truck}
          data={deliveryManagers}
          isLoading={false}
          mutations={useDeliveryManagerMutations()}
          queryKey="deliveryManagers"
        />
      </TabsContent>
    </Tabs>
    </div>
  );
};
