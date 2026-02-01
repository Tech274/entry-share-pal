import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LabRequest } from '@/types/labRequest';
import { DeliveryRequest } from '@/types/deliveryRequest';
import { 
  ClipboardList, 
  Truck, 
  Users, 
  IndianRupee, 
  TrendingUp, 
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface DashboardProps {
  labRequests: LabRequest[];
  deliveryRequests: DeliveryRequest[];
}

export const Dashboard = ({ labRequests, deliveryRequests }: DashboardProps) => {
  // Calculate statistics
  const totalLabRequests = labRequests.length;
  const totalDeliveryRequests = deliveryRequests.length;
  
  const totalLabUsers = labRequests.reduce((sum, r) => sum + (r.userCount || 0), 0);
  const totalDeliveryUsers = deliveryRequests.reduce((sum, r) => sum + (r.numberOfUsers || 0), 0);
  
  const totalLabRevenue = labRequests.reduce((sum, r) => sum + (r.totalAmountForTraining || 0), 0);
  const totalDeliveryRevenue = deliveryRequests.reduce((sum, r) => sum + (r.totalAmount || 0), 0);
  
  const totalMargin = labRequests.reduce((sum, r) => sum + (r.margin || 0), 0);
  
  const solutionsSent = labRequests.filter(r => r.status === 'Solution Sent').length;
  const solutionsPending = labRequests.filter(r => r.status === 'Solution Pending').length;
  
  const deliveryReady = deliveryRequests.filter(r => r.labStatus === 'Ready' || r.labStatus === 'Completed').length;
  const deliveryInProgress = deliveryRequests.filter(r => r.labStatus === 'In Progress').length;

  const stats = [
    {
      title: 'Total Solutions',
      value: totalLabRequests,
      description: `${solutionsSent} sent, ${solutionsPending} pending`,
      icon: ClipboardList,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Total Deliveries',
      value: totalDeliveryRequests,
      description: `${deliveryReady} ready, ${deliveryInProgress} in progress`,
      icon: Truck,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Total Users',
      value: totalLabUsers + totalDeliveryUsers,
      description: `${totalLabUsers} solutions, ${totalDeliveryUsers} delivery`,
      icon: Users,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Total Revenue',
      value: `₹${(totalLabRevenue + totalDeliveryRevenue).toLocaleString()}`,
      description: 'Combined solutions & delivery',
      icon: IndianRupee,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
    {
      title: 'Total Margin',
      value: `₹${totalMargin.toLocaleString()}`,
      description: 'From solutions',
      icon: TrendingUp,
      color: totalMargin >= 0 ? 'text-emerald-500' : 'text-red-500',
      bgColor: totalMargin >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10',
    },
  ];

  // Recent activity
  const recentLabRequests = [...labRequests]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);
    
  const recentDeliveryRequests = [...deliveryRequests]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Solutions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-blue-500" />
              Recent Solutions
            </CardTitle>
            <CardDescription>Latest solution requests</CardDescription>
          </CardHeader>
          <CardContent>
            {recentLabRequests.length === 0 ? (
              <p className="text-muted-foreground text-sm">No solutions yet</p>
            ) : (
              <div className="space-y-3">
                {recentLabRequests.map((req) => (
                  <div key={req.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{req.labName || 'Untitled'}</p>
                      <p className="text-sm text-muted-foreground">{req.client}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {req.status === 'Solution Sent' ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <Clock className="h-4 w-4 text-amber-500" />
                      )}
                      <span className="text-sm font-medium">₹{req.totalAmountForTraining?.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Deliveries */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-green-500" />
              Recent Deliveries
            </CardTitle>
            <CardDescription>Latest delivery requests</CardDescription>
          </CardHeader>
          <CardContent>
            {recentDeliveryRequests.length === 0 ? (
              <p className="text-muted-foreground text-sm">No deliveries yet</p>
            ) : (
              <div className="space-y-3">
                {recentDeliveryRequests.map((req) => (
                  <div key={req.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{req.trainingName || 'Untitled'}</p>
                      <p className="text-sm text-muted-foreground">{req.client}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {req.labStatus === 'Ready' || req.labStatus === 'Completed' ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : req.labStatus === 'In Progress' ? (
                        <Clock className="h-4 w-4 text-amber-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="text-sm font-medium">₹{req.totalAmount?.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
