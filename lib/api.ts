export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://bcn-housing-backend.onrender.com";

export const BACKEND_URL = API_BASE_URL;

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function getErrorMessage(body: unknown, fallback: string) {
  if (!body || typeof body !== "object") return fallback;
  const record = body as { detail?: unknown; message?: unknown };
  const detail = record.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((item) =>
        item && typeof item === "object" && "msg" in item
          ? String(item.msg)
          : String(item),
      )
      .join("; ");
  }
  if (typeof record.message === "string") return record.message;
  return fallback;
}

export async function fetchFromBackend<T = unknown>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {}),
    },
  });

  if (response.status === 204) return undefined as T;

  const contentType = response.headers.get("content-type") || "";
  const body: unknown = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    throw new ApiError(
      getErrorMessage(body, `Backend request failed (${response.status})`),
      response.status,
    );
  }

  return body as T;
}

export interface Property {
  id: string;
  transaction_type: "BUY" | "RENT";
  title: string;
  description: string;
  location: string;
  neighborhood: string | null;
  price: number;
  area_sqm: number;
  bedrooms: number | null;
  bathrooms: number | null;
  property_type: string;
  condition: string | null;
  floor: string | null;
  has_elevator: boolean | null;
  images: string[];
  source: string;
  data_label: "DEMO" | "REAL";
  status: "AVAILABLE" | "UNAVAILABLE" | "CLOSED";
  created_at: string;
  updated_at: string;
}

export interface PropertyMatch {
  property_id: string;
  match_score: number;
  is_match: boolean;
  explanations: string[];
  incompatible_requirements: string[];
  missing_or_unverified: string[];
  score_is_not_a_guarantee: boolean;
  property: Property;
}

export interface MatchingResponse {
  requirement_id: string;
  matches: PropertyMatch[];
  match_count: number;
  excluded_properties: Array<{
    property_id: string;
    incompatible_requirements: string[];
    property: Property;
  }>;
  message: string | null;
  method: string;
}

export interface RequirementPayload {
  transaction_type: "BUY" | "RENT";
  budget_min?: number;
  budget_max?: number;
  preferred_locations: string[];
  property_type?: string;
  bedrooms_min?: number;
  area_min_sqm?: number;
  timeline?: string;
  additional_requirements?: string;
  preferred_language: string;
  contact_name: string;
  contact_email?: string;
  contact_phone?: string;
}

export interface RequirementResponse {
  id: string;
  lead_id: string;
  transaction_type: "BUY" | "RENT";
  created_at: string;
  message: string;
}

export interface Agent {
  id: string;
  profile_type: "AGENCY" | "INDEPENDENT";
  name: string;
  agency_name: string | null;
  service_areas: string[];
  specializations: string[];
  languages: string[];
  contact_email: string | null;
  contact_phone: string | null;
  verified: boolean;
  active: boolean;
  created_at: string;
}

export interface Lead {
  id: string;
  status:
    | "NEW"
    | "REVIEWING"
    | "MATCHED"
    | "CONTACTED"
    | "VIEWING_SCHEDULED"
    | "CONVERTED"
    | "CLOSED";
  requirement: {
    id: string;
    transaction_type: "BUY" | "RENT";
    budget_min: number | null;
    budget_max: number | null;
    preferred_locations: string[];
    property_type: string | null;
    bedrooms_min: number | null;
    area_min_sqm: number | null;
    timeline: string | null;
    additional_requirements: string | null;
    preferred_language: string;
    contact: { name: string; email: string | null; phone: string | null };
    created_at: string;
    updated_at: string;
  };
  assigned_agent: Agent | null;
  created_at: string;
  updated_at: string;
}

export interface ViewingRequest {
  id: string;
  requirement_id: string;
  property: Property;
  customer: { name: string; email: string | null; phone: string | null };
  assigned_agent_id: string | null;
  preferred_at: string | null;
  customer_notes: string | null;
  report_references: string[];
  status: "NEW" | "SCHEDULED" | "COMPLETED" | "CANCELLED";
  created_at: string;
  updated_at: string;
}

export const publicApi = {
  listProperties(transactionType?: "BUY" | "RENT") {
    const query = transactionType
      ? `?transaction_type=${transactionType}`
      : "";
    return fetchFromBackend<{ properties: Property[] }>(
      `/api/properties${query}`,
    );
  },
  createRequirement(payload: RequirementPayload) {
    return fetchFromBackend<RequirementResponse>("/api/requirements", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  getMatches(requirementId: string) {
    return fetchFromBackend<MatchingResponse>(
      `/api/requirements/${encodeURIComponent(requirementId)}/matches`,
    );
  },
  requestViewing(payload: {
    requirement_id: string;
    property_id: string;
    preferred_at?: string;
    customer_notes?: string;
  }) {
    return fetchFromBackend<{
      id: string;
      status: string;
      created_at: string;
      message: string;
    }>("/api/viewing-requests", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};

function adminRequest<T>(token: string, endpoint: string, options: RequestInit = {}) {
  return fetchFromBackend<T>(endpoint, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
}

export const adminApi = {
  login(username: string, password: string) {
    return fetchFromBackend<{
      access_token: string;
      token_type: "bearer";
      expires_in: number;
    }>("/api/admin/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
  },
  listLeads(token: string) {
    return adminRequest<{ leads: Lead[] }>(token, "/api/admin/leads");
  },
  getLead(token: string, leadId: string) {
    return adminRequest<Lead & {
      matching_results: MatchingResponse;
      notes: Array<{ id: string; note: string; created_at: string }>;
      history: Array<{
        event_type: string;
        details: Record<string, unknown>;
        created_at: string;
      }>;
    }>(token, `/api/admin/leads/${encodeURIComponent(leadId)}`);
  },
  getLeadMatches(token: string, leadId: string) {
    return adminRequest<MatchingResponse>(
      token,
      `/api/admin/leads/${encodeURIComponent(leadId)}/matches`,
    );
  },
  updateLeadStatus(token: string, leadId: string, status: Lead["status"]) {
    return adminRequest(token, `/api/admin/leads/${encodeURIComponent(leadId)}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },
  assignLeadAgent(token: string, leadId: string, agentId: string) {
    return adminRequest(token, `/api/admin/leads/${encodeURIComponent(leadId)}/agent`, {
      method: "PUT",
      body: JSON.stringify({ agent_id: agentId }),
    });
  },
  listAgents(token: string) {
    return adminRequest<{ agents: Agent[] }>(token, "/api/admin/agents");
  },
  updateAgentStatus(
    token: string,
    agentId: string,
    active: boolean,
    verified: boolean,
  ) {
    return adminRequest(token, `/api/admin/agents/${encodeURIComponent(agentId)}/status`, {
      method: "PATCH",
      body: JSON.stringify({ active, verified }),
    });
  },
  listProperties(token: string) {
    return adminRequest<{ properties: Property[] }>(
      token,
      "/api/admin/properties",
    );
  },
  updatePropertyStatus(
    token: string,
    propertyId: string,
    status: Property["status"],
  ) {
    return adminRequest(
      token,
      `/api/admin/properties/${encodeURIComponent(propertyId)}/status`,
      { method: "PATCH", body: JSON.stringify({ status }) },
    );
  },
  listViewingRequests(token: string) {
    return adminRequest<{ viewing_requests: ViewingRequest[] }>(
      token,
      "/api/admin/viewing-requests",
    );
  },
  updateViewingRequest(
    token: string,
    requestId: string,
    payload: {
      status: ViewingRequest["status"];
      assigned_agent_id?: string | null;
    },
  ) {
    return adminRequest(
      token,
      `/api/admin/viewing-requests/${encodeURIComponent(requestId)}`,
      { method: "PATCH", body: JSON.stringify(payload) },
    );
  },
};
