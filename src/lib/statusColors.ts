// Status color utilities for consistent status display across the app

export const getStatusColor = (status: string): string => {
  const statusLower = status.toLowerCase();
  
  // Solution statuses
  if (statusLower === 'solution pending') {
    return 'bg-yellow-50 text-yellow-700 border-yellow-200';
  }
  if (statusLower === 'solution sent') {
    return 'bg-green-50 text-green-700 border-green-200';
  }
  
  // Delivery statuses
  if (statusLower === 'pending') {
    return 'bg-yellow-50 text-yellow-700 border-yellow-200';
  }
  if (statusLower === 'in progress') {
    return 'bg-blue-50 text-blue-700 border-blue-200';
  }
  if (statusLower === 'ready') {
    return 'bg-green-50 text-green-700 border-green-200';
  }
  if (statusLower === 'completed') {
    return 'bg-gray-50 text-gray-700 border-gray-200';
  }
  
  return 'bg-gray-50 text-gray-700 border-gray-200';
};

export const getStatusBadgeVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  const statusLower = status.toLowerCase();
  
  if (statusLower.includes('pending')) return 'outline';
  if (statusLower.includes('sent') || statusLower.includes('ready') || statusLower.includes('completed')) return 'default';
  if (statusLower.includes('progress')) return 'secondary';
  
  return 'outline';
};

// Lab type colors
export const getLabTypeColor = (labType: string): string => {
  switch (labType.toLowerCase()) {
    case 'cloud':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'on-premise':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'hybrid':
      return 'bg-teal-50 text-teal-700 border-teal-200';
    case 'virtual':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

// Cloud provider colors
export const getCloudColor = (cloud: string): string => {
  switch (cloud.toLowerCase()) {
    case 'aws':
      return 'bg-orange-50 text-orange-700 border-orange-200';
    case 'azure':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'gcp':
      return 'bg-red-50 text-red-700 border-red-200';
    case 'oracle':
      return 'bg-red-100 text-red-800 border-red-300';
    case 'on-premise':
      return 'bg-gray-50 text-gray-700 border-gray-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

// LOB colors
export const getLOBColor = (lob: string): string => {
  switch (lob.toLowerCase()) {
    case 'standalone':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'vilt':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'blended':
      return 'bg-teal-50 text-teal-700 border-teal-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};
