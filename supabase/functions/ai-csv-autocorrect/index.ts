import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Expected field schema for delivery requests - Listed in priority order for matching
// IMPORTANT: Entries at the top have higher priority when there are ambiguous matches
const EXPECTED_FIELDS: [string, string[]][] = [
  // Highest priority - specific field names first
  ['potentialId', ['potential id', 'potentialid', 'potential_id', 'pid', 'pot id']],
  ['freshDeskTicketNumber', ['freshdesk ticket number', 'freshdesk ticket', 'ticket number', 'ticket #', 'ticket no', 'fd ticket']],
  ['trainingName', ['training name', 'trainingname', 'training', 'course name', 'course', 'program name']],
  ['numberOfUsers', ['number of users', 'numberofusers', 'user count', 'users', 'no of users', 'num users', 'participants', 'attendees']],
  ['client', ['client', 'client name', 'customer', 'company', 'organization', 'org']],
  ['month', ['month', 'billing month', 'delivery month', 'mon']],
  ['year', ['year', 'billing year', 'delivery year', 'yr']],
  ['receivedOn', ['received on', 'receivedon', 'received date', 'request date', 'created date', 'date received']],
  
  // Lab-related fields - labName should match "lab" before cloud
  ['labName', ['lab name', 'labname', 'lab title', 'lab']],
  ['labStatus', ['lab status', 'labstatus', 'status', 'delivery status', 'current status']],
  ['labSetupRequirement', ['lab setup requirement', 'setup requirement', 'requirements', 'setup']],
  
  // Cloud/infra fields - should only match specific terms
  ['cloud', ['lab type', 'infra type', 'infrastructure', 'platform type', 'type', 'cloud']],
  ['cloudType', ['cloud provider', 'provider', 'cloud type', 'cloudtype']],
  ['tpLabType', ['tp lab type', 'tplabtype', 'third party lab', 'tp type', '3rd party', 'third party']],
  
  // Financial fields - put BEFORE people fields to prevent "am" matching "amount"
  ['totalAmount', ['total amount', 'totalamount', 'amount', 'total', 'revenue', 'total cost', 'total value']],
  ['inputCostPerUser', ['input cost per user', 'input cost', 'cost per user', 'unit cost', 'base cost', 'cost in']],
  ['sellingCostPerUser', ['selling cost per user', 'selling cost', 'sell price', 'unit price', 'price per user', 'cost out']],
  
  // People fields - removed 'am' from accountManager to prevent false positives
  ['requester', ['requester', 'requested by', 'requester name', 'requestor', 'person', 'contact']],
  ['agentName', ['agent name', 'agentname', 'agent', 'sales agent', 'rep']],
  ['accountManager', ['account manager', 'accountmanager', 'acct manager', 'a.m.']],
  
  // Date fields
  ['startDate', ['start date', 'startdate', 'lab start date', 'begin date', 'from date']],
  ['endDate', ['end date', 'enddate', 'lab end date', 'finish date', 'to date']],
  
  // Other
  ['lineOfBusiness', ['line of business', 'lineofbusiness', 'lob', 'business line', 'segment']],
  ['invoiceDetails', ['invoice details', 'invoicedetails', 'invoice', 'invoice number', 'invoice no', 'billing details']],
];

// Valid status values
const VALID_STATUSES = {
  'pending': 'Pending',
  'work-in-progress': 'Work-in-Progress',
  'wip': 'Work-in-Progress',
  'in progress': 'Work-in-Progress',
  'test credentials shared': 'Test Credentials Shared',
  'test creds': 'Test Credentials Shared',
  'sent for testing': 'Test Credentials Shared',
  'delivered': 'Delivered',
  'delivery in-progress': 'Delivery In-Progress',
  'delivery in progress': 'Delivery In-Progress',
  'delivery completed': 'Delivery Completed',
  'completed': 'Delivery Completed',
  'cancelled': 'Cancelled',
  'canceled': 'Cancelled',
};

// Valid cloud/lab types
const VALID_CLOUD_TYPES = {
  'public cloud': 'Public Cloud',
  'publiccloud': 'Public Cloud',
  'public': 'Public Cloud',
  'aws': 'Public Cloud',
  'azure': 'Public Cloud',
  'gcp': 'Public Cloud',
  'private cloud': 'Private Cloud',
  'privatecloud': 'Private Cloud',
  'private': 'Private Cloud',
  'tp labs': 'TP Labs',
  'tplabs': 'TP Labs',
  'third party': 'TP Labs',
  'third-party': 'TP Labs',
  'sap': 'TP Labs',
  'oracle': 'TP Labs',
  'oem': 'TP Labs',
};

// Valid cloud types (providers)
const VALID_PROVIDERS = {
  'aws': 'AWS',
  'amazon': 'AWS',
  'amazon web services': 'AWS',
  'azure': 'Azure',
  'microsoft azure': 'Azure',
  'microsoft': 'Azure',
  'gcp': 'GCP',
  'google': 'GCP',
  'google cloud': 'GCP',
  'google cloud platform': 'GCP',
};

// Valid TP Lab types
const VALID_TP_TYPES = {
  'sap': 'SAP',
  'oracle': 'Oracle',
  'oem': 'OEM',
};

// Valid LOB values
const VALID_LOB = {
  'standalone': 'Standalone',
  'stand alone': 'Standalone',
  'stand-alone': 'Standalone',
  'vilt': 'VILT',
  'virtual instructor led': 'VILT',
  'virtual instructor-led': 'VILT',
  'integrated': 'Integrated',
  'integration': 'Integrated',
};

// Month normalization
const MONTH_MAP: Record<string, string> = {
  'jan': 'January', 'january': 'January', '1': 'January', '01': 'January',
  'feb': 'February', 'february': 'February', '2': 'February', '02': 'February',
  'mar': 'March', 'march': 'March', '3': 'March', '03': 'March',
  'apr': 'April', 'april': 'April', '4': 'April', '04': 'April',
  'may': 'May', '5': 'May', '05': 'May',
  'jun': 'June', 'june': 'June', '6': 'June', '06': 'June',
  'jul': 'July', 'july': 'July', '7': 'July', '07': 'July',
  'aug': 'August', 'august': 'August', '8': 'August', '08': 'August',
  'sep': 'September', 'sept': 'September', 'september': 'September', '9': 'September', '09': 'September',
  'oct': 'October', 'october': 'October', '10': 'October',
  'nov': 'November', 'november': 'November', '11': 'November',
  'dec': 'December', 'december': 'December', '12': 'December',
};

interface RowData {
  [key: string]: string | number;
}

interface CorrectedRow {
  potentialId: string;
  freshDeskTicketNumber: string;
  trainingName: string;
  numberOfUsers: number;
  client: string;
  month: string;
  year: number;
  receivedOn: string;
  cloud: string;
  cloudType: string;
  tpLabType: string;
  labName: string;
  requester: string;
  agentName: string;
  accountManager: string;
  labStatus: string;
  labType: string;
  startDate: string;
  endDate: string;
  labSetupRequirement: string;
  inputCostPerUser: number;
  sellingCostPerUser: number;
  totalAmount: number;
  lineOfBusiness: string;
  invoiceDetails: string;
  clientId?: string | null;
  agentId?: string | null;
  accountManagerId?: string | null;
  requesterId?: string | null;
}

interface NamedReference {
  id: string;
  name: string;
}

interface ReferenceData {
  clients?: NamedReference[];
  agents?: NamedReference[];
  accountManagers?: NamedReference[];
  solutionManagers?: NamedReference[];
  deliveryManagers?: NamedReference[];
}

// Find best matching field from CSV headers
function findMatchingField(header: string, fieldAliases: string[]): boolean {
  const normalizedHeader = header.toLowerCase().trim().replace(/[_\-\s]+/g, ' ');
  return fieldAliases.some(alias => {
    const normalizedAlias = alias.toLowerCase().trim().replace(/[_\-\s]+/g, ' ');
    return normalizedHeader === normalizedAlias || 
           normalizedHeader.includes(normalizedAlias) || 
           normalizedAlias.includes(normalizedHeader);
  });
}

// Create header mapping from CSV headers to expected fields
// Uses priority order from EXPECTED_FIELDS array - first match wins per header
function createHeaderMapping(csvHeaders: string[]): Record<string, string> {
  const mapping: Record<string, string> = {};
  const usedFields = new Set<string>();
  
  for (const header of csvHeaders) {
    // Try each field in priority order
    for (const [field, aliases] of EXPECTED_FIELDS) {
      // Skip if this field is already mapped
      if (usedFields.has(field)) continue;
      
      if (findMatchingField(header, aliases)) {
        mapping[header.toLowerCase()] = field;
        usedFields.add(field);
        break;
      }
    }
  }
  
  return mapping;
}

// Normalize status value
function normalizeStatus(value: string): string {
  const normalized = value.toLowerCase().trim();
  return VALID_STATUSES[normalized as keyof typeof VALID_STATUSES] || 'Pending';
}

// Normalize cloud/lab type value
function normalizeCloud(value: string): string {
  const normalized = value.toLowerCase().trim();
  return VALID_CLOUD_TYPES[normalized as keyof typeof VALID_CLOUD_TYPES] || '';
}

// Normalize cloud provider
function normalizeProvider(value: string): string {
  const normalized = value.toLowerCase().trim();
  return VALID_PROVIDERS[normalized as keyof typeof VALID_PROVIDERS] || '';
}

// Normalize TP lab type
function normalizeTPType(value: string): string {
  const normalized = value.toLowerCase().trim();
  return VALID_TP_TYPES[normalized as keyof typeof VALID_TP_TYPES] || '';
}

// Normalize LOB value
function normalizeLOB(value: string): string {
  const normalized = value.toLowerCase().trim();
  return VALID_LOB[normalized as keyof typeof VALID_LOB] || '';
}

// Normalize month value
function normalizeMonth(value: string): string {
  const normalized = value.toLowerCase().trim();
  return MONTH_MAP[normalized] || new Date().toLocaleString('default', { month: 'long' });
}

// Parse number safely
function parseNumber(value: string | number | undefined): number {
  if (value === undefined || value === null || value === '') return 0;
  if (typeof value === 'number') return value;
  // Remove currency symbols and commas
  const cleaned = value.replace(/[₹$,\s]/g, '').replace(/[^\d.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

function resolveIdByName(list: NamedReference[] | undefined, name: string): string | null {
  if (!list?.length || !name?.trim()) return null;
  const target = name.trim().toLowerCase();
  return list.find((item) => item.name?.trim().toLowerCase() === target)?.id ?? null;
}

// Correct a single row
function correctRow(row: RowData, headerMapping: Record<string, string>): CorrectedRow {
  const mappedRow: Record<string, string | number> = {};
  
  // Map CSV values to expected fields
  for (const [originalHeader, value] of Object.entries(row)) {
    const normalizedHeader = originalHeader.toLowerCase();
    const mappedField = headerMapping[normalizedHeader];
    if (mappedField) {
      mappedRow[mappedField] = value;
    }
  }
  
  // Get current date for defaults
  const now = new Date();
  
  // Build corrected row with all normalizations
  const corrected: CorrectedRow = {
    potentialId: String(mappedRow.potentialId || ''),
    freshDeskTicketNumber: String(mappedRow.freshDeskTicketNumber || ''),
    trainingName: String(mappedRow.trainingName || mappedRow.labName || ''),
    numberOfUsers: parseNumber(mappedRow.numberOfUsers),
    client: String(mappedRow.client || 'Unknown Client'),
    month: normalizeMonth(String(mappedRow.month || '')),
    year: parseNumber(mappedRow.year) || now.getFullYear(),
    receivedOn: String(mappedRow.receivedOn || ''),
    cloud: normalizeCloud(String(mappedRow.cloud || '')),
    cloudType: normalizeProvider(String(mappedRow.cloudType || '')),
    tpLabType: normalizeTPType(String(mappedRow.tpLabType || '')),
    labName: String(mappedRow.labName || mappedRow.trainingName || ''),
    requester: String(mappedRow.requester || ''),
    agentName: String(mappedRow.agentName || ''),
    accountManager: String(mappedRow.accountManager || ''),
    labStatus: normalizeStatus(String(mappedRow.labStatus || 'Pending')),
    labType: '',
    startDate: String(mappedRow.startDate || ''),
    endDate: String(mappedRow.endDate || ''),
    labSetupRequirement: String(mappedRow.labSetupRequirement || ''),
    inputCostPerUser: parseNumber(mappedRow.inputCostPerUser),
    sellingCostPerUser: parseNumber(mappedRow.sellingCostPerUser),
    totalAmount: parseNumber(mappedRow.totalAmount),
    lineOfBusiness: normalizeLOB(String(mappedRow.lineOfBusiness || '')),
    invoiceDetails: String(mappedRow.invoiceDetails || ''),
  };
  
  // Auto-detect cloud type from other fields if not set
  if (!corrected.cloud && corrected.cloudType) {
    if (['AWS', 'Azure', 'GCP'].includes(corrected.cloudType)) {
      corrected.cloud = 'Public Cloud';
    }
  }
  if (!corrected.cloud && corrected.tpLabType) {
    corrected.cloud = 'TP Labs';
  }
  
  return corrected;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { headers, rows, requestType, referenceData } = await req.json() as {
      headers: string[];
      rows: RowData[];
      requestType?: 'solutions' | 'delivery';
      referenceData?: ReferenceData;
    };
    
    if (!headers || !rows || !Array.isArray(rows)) {
      return new Response(
        JSON.stringify({ error: 'Invalid input: headers and rows required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${rows.length} rows with ${headers.length} columns`);
    console.log('Headers:', headers);

    // Create header mapping
    const headerMapping = createHeaderMapping(headers);
    console.log('Header mapping:', headerMapping);

    // Track unmapped headers for AI enhancement
    const unmappedHeaders = headers.filter(
      (h: string) => !headerMapping[h.toLowerCase()]
    );
    
    if (unmappedHeaders.length > 0) {
      console.log('Unmapped headers (will be ignored):', unmappedHeaders);
    }

    // Correct all rows
    const correctedRows = rows.map((row: RowData) => {
      const corrected = correctRow(row, headerMapping);
      const requesterSource =
        requestType === 'solutions'
          ? referenceData?.solutionManagers
          : referenceData?.deliveryManagers;

      corrected.clientId = resolveIdByName(referenceData?.clients, corrected.client);
      corrected.agentId = resolveIdByName(referenceData?.agents, corrected.agentName);
      corrected.accountManagerId = resolveIdByName(referenceData?.accountManagers, corrected.accountManager);
      corrected.requesterId = resolveIdByName(requesterSource, corrected.requester);
      return corrected;
    });

    // Generate summary of corrections
    const corrections: string[] = [];
    const mappedFields = Object.values(headerMapping);
    if (mappedFields.length < headers.length) {
      corrections.push(`Mapped ${mappedFields.length} of ${headers.length} columns`);
    }
    if (unmappedHeaders.length > 0) {
      corrections.push(`Ignored unmapped columns: ${unmappedHeaders.join(', ')}`);
    }

    // Count normalized values
    let statusNormalized = 0;
    let cloudNormalized = 0;
    let lobNormalized = 0;

    correctedRows.forEach((row: CorrectedRow) => {
      if (row.labStatus && row.labStatus !== 'Pending') statusNormalized++;
      if (row.cloud) cloudNormalized++;
      if (row.lineOfBusiness) lobNormalized++;
    });

    if (statusNormalized > 0) corrections.push(`Normalized ${statusNormalized} status values`);
    if (cloudNormalized > 0) corrections.push(`Identified ${cloudNormalized} lab types`);
    if (lobNormalized > 0) corrections.push(`Normalized ${lobNormalized} LOB values`);

    return new Response(
      JSON.stringify({
        success: true,
        correctedRows,
        headerMapping,
        unmappedHeaders,
        corrections,
        summary: `Successfully processed ${correctedRows.length} records with ${corrections.length} auto-corrections applied.`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('AI CSV Autocorrect error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to process CSV data' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
