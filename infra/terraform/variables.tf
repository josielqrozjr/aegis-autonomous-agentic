# ──────────────────────────────────────────────────────────────
# AEGIS — Terraform Variables
# ──────────────────────────────────────────────────────────────

variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "region" {
  description = "GCP region for all resources"
  type        = string
  default     = "us-central1"
}

variable "project_name" {
  description = "Human-readable project name"
  type        = string
  default     = "AEGIS"
}

# ── Artifact Registry ──

variable "registry_name" {
  description = "Artifact Registry repository name"
  type        = string
  default     = "aegis"
}

# ── Cloud Storage ──

variable "uploads_bucket_name" {
  description = "GCS bucket for document uploads (must be globally unique)"
  type        = string
}

# ── Cloud Run ──

variable "api_image" {
  description = "Docker image URI for API service (set after first push)"
  type        = string
  default     = ""
}

variable "worker_image" {
  description = "Docker image URI for Worker service (set after first push)"
  type        = string
  default     = ""
}

variable "web_image" {
  description = "Docker image URI for Web (Next.js) service (set after first push)"
  type        = string
  default     = ""
}

variable "api_memory" {
  description = "Memory limit for API service"
  type        = string
  default     = "512Mi"
}

variable "worker_memory" {
  description = "Memory limit for Worker service"
  type        = string
  default     = "512Mi"
}

variable "web_memory" {
  description = "Memory limit for Web service"
  type        = string
  default     = "256Mi"
}

# ── Vertex AI / Gemini ──

variable "google_api_key" {
  description = "Google API Key for Gemini calls (sensitive)"
  type        = string
  sensitive   = true
  default     = ""
}
