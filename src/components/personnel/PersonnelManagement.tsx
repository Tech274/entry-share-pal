
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Users, UserCheck, Building, Briefcase, Truck } from 'lucide-react';
import { usePersonnel } from '@/hooks/usePersonnel';
import { PersonnelTable } from './PersonnelTable';

export const PersonnelManagement = () => {
  const {
    agents,
    accountManagers,
    clients,
    solutionManagers,
    deliveryManagers,
    loading,
    error,
    addAgent,
    updateAgent,
    deleteAgent,
    addAccountManager,
    updateAccountManager,
    deleteAccountManager,
    addClient,
    updateClient,
    deleteClient,
    addSolutionManager,
    updateSolutionManager,
    deleteSolutionManager,
    addDeliveryManager,
    updateDeliveryManager,
    deleteDeliveryManager,
  } = usePersonnel();

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Database Schema Missing</AlertTitle>
        <AlertDescription>
          The personnel tables don't exist. Please run the migration script:{' '}
          <code className="bg-muted px-2 py-1 rounded">supabase/RUN_PERSONNEL_MIGRATIONS.sql</code>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Personnel & Clients Management</h2>
      </div>

      <Tabs defaultValue="agents" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5 max-w-3xl">
          <TabsTrigger value="agents" className="gap-2">
            <Users className="w-4 h-4" />
            Agents
          </TabsTrigger>
          <TabsTrigger value="accountManagers" className="gap-2">
            <UserCheck className="w-4 h-4" />
            Account Managers
          </TabsTrigger>
          <TabsTrigger value="clients" className="gap-2">
            <Building className="w-4 h-4" />
            Clients
          </TabsTrigger>
          <TabsTrigger value="solutionManagers" className="gap-2">
            <Briefcase className="w-4 h-4" />
            Solution Managers
          </TabsTrigger>
          <TabsTrigger value="deliveryManagers" className="gap-2">
            <Truck className="w-4 h-4" />
            Delivery Managers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="agents">
          <PersonnelTable
            title="Agents"
            data={agents}
            loading={loading}
            onAdd={addAgent}
            onUpdate={updateAgent}
            onDelete={deleteAgent}
          />
        </TabsContent>

        <TabsContent value="accountManagers">
          <PersonnelTable
            title="Account Managers"
            data={accountManagers}
            loading={loading}
            onAdd={addAccountManager}
            onUpdate={updateAccountManager}
            onDelete={deleteAccountManager}
          />
        </TabsContent>

        <TabsContent value="clients">
          <PersonnelTable
            title="Clients"
            data={clients}
            loading={loading}
            onAdd={addClient}
            onUpdate={updateClient}
            onDelete={deleteClient}
            accountManagers={accountManagers}
          />
        </TabsContent>

        <TabsContent value="solutionManagers">
          <PersonnelTable
            title="Solution Managers"
            data={solutionManagers}
            loading={loading}
            onAdd={addSolutionManager}
            onUpdate={updateSolutionManager}
            onDelete={deleteSolutionManager}
          />
        </TabsContent>

        <TabsContent value="deliveryManagers">
          <PersonnelTable
            title="Delivery Managers"
            data={deliveryManagers}
            loading={loading}
            onAdd={addDeliveryManager}
            onUpdate={updateDeliveryManager}
            onDelete={deleteDeliveryManager}
            
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
