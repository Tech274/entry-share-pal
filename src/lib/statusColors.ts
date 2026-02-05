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
  if (statusLower === 'work-in-progress') {
    return 'bg-blue-50 text-blue-700 border-blue-200';
  }
  if (statusLower === 'test credentials shared') {
    return 'bg-purple-50 text-purple-700 border-purple-200';
  }
  if (statusLower === 'delivered') {
    return 'bg-green-50 text-green-700 border-green-200';
  }
  if (statusLower === 'delivery in-progress') {
    return 'bg-cyan-50 text-cyan-700 border-cyan-200';
  }
  if (statusLower === 'cancelled') {
    return 'bg-red-50 text-red-700 border-red-200';
  }
  // Legacy statuses for backward compatibility
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

// Lab Type colors (Public Cloud/Private Cloud/TP Labs)
export const getCloudColor = (cloud: string): string => {
  switch (cloud.toLowerCase()) {
    case 'public cloud':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'private cloud':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'tp labs':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

// Cloud type colors (AWS, Azure, GCP)
export const getCloudTypeColor = (cloudType: string): string => {
  switch (cloudType.toLowerCase()) {
    case 'aws':
      return 'bg-orange-50 text-orange-700 border-orange-200';
    case 'azure':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'gcp':
      return 'bg-red-50 text-red-700 border-red-200';
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
    case 'integrated':
      return 'bg-teal-50 text-teal-700 border-teal-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

// TP Lab Type colors (SAP, Oracle, OEM)
export const getTPLabTypeColor = (tpLabType: string): string => {
  switch (tpLabType.toLowerCase()) {
    case 'sap':
      return 'bg-cyan-50 text-cyan-700 border-cyan-200';
    case 'oracle':
      return 'bg-red-50 text-red-700 border-red-200';
    case 'oem':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};
