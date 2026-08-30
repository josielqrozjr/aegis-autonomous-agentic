# ══════════════════════════════════════════════════════════════
# AEGIS — Full GCP Infrastructure (Free Tier)
#
# Provisions: APIs, Service Account, Artifact Registry,
#             Firestore, Cloud Storage, Cloud Run (API + Worker + Web)
# ══════════════════════════════════════════════════════════════

terraform {
  required_version = ">= 1.5"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }

  # Local backend — fine for hackathon
  backend "local" {}
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# ──────────────────────────────────────────────────────────────
# 1. Enable GCP APIs
# ──────────────────────────────────────────────────────────────

locals {
  apis = [
    "run.googleapis.com",
    "firestore.googleapis.com",
    "storage.googleapis.com",
    "artifactregistry.googleapis.com",
    "aiplatform.googleapis.com",      # Vertex AI / Gemini
    "cloudbuild.googleapis.com",
    "iam.googleapis.com",
    "cloudresourcemanager.googleapis.com",
  ]
}

resource "google_project_service" "apis" {
  for_each = toset(local.apis)

  project            = var.project_id
  service            = each.value
  disable_on_destroy = false
}

# ──────────────────────────────────────────────────────────────
# 2. Service Account
# ──────────────────────────────────────────────────────────────

resource "google_service_account" "aegis" {
  account_id   = "aegis-runtime"
  display_name = "AEGIS Runtime Service Account"
  project      = var.project_id

  depends_on = [google_project_service.apis["iam.googleapis.com"]]
}

locals {
  sa_roles = [
    "roles/datastore.user",           # Firestore read/write
    "roles/storage.objectAdmin",      # Cloud Storage upload/download
    "roles/aiplatform.user",          # Vertex AI / Gemini
    "roles/logging.logWriter",        # Cloud Logging
    "roles/cloudtrace.agent",         # Cloud Trace
    "roles/run.invoker",              # Cloud Run invoke (service-to-service)
  ]
}

resource "google_project_iam_member" "aegis_sa_roles" {
  for_each = toset(local.sa_roles)

  project = var.project_id
  role    = each.value
  member  = "serviceAccount:${google_service_account.aegis.email}"
}

# ──────────────────────────────────────────────────────────────
# 3. Artifact Registry (Docker images)
# ──────────────────────────────────────────────────────────────

resource "google_artifact_registry_repository" "aegis" {
  location      = var.region
  repository_id = var.registry_name
  format        = "DOCKER"
  description   = "AEGIS Docker images"

  depends_on = [google_project_service.apis["artifactregistry.googleapis.com"]]
}

# ──────────────────────────────────────────────────────────────
# 4. Firestore Database (Native mode)
# ──────────────────────────────────────────────────────────────

resource "google_firestore_database" "aegis" {
  name        = "(default)"
  project     = var.project_id
  location_id = var.region
  type        = "FIRESTORE_NATIVE"

  depends_on = [google_project_service.apis["firestore.googleapis.com"]]
}

# ──────────────────────────────────────────────────────────────
# 5. Cloud Storage (document uploads)
# ──────────────────────────────────────────────────────────────

resource "google_storage_bucket" "uploads" {
  name     = var.uploads_bucket_name
  location = var.region
  project  = var.project_id

  uniform_bucket_level_access = true
  force_destroy               = true # hackathon — easy cleanup

  lifecycle_rule {
    action {
      type = "Delete"
    }
    condition {
      age = 30 # auto-cleanup after 30 days
    }
  }

  depends_on = [google_project_service.apis["storage.googleapis.com"]]
}

# ──────────────────────────────────────────────────────────────
# 6. Cloud Run — API
# ──────────────────────────────────────────────────────────────

resource "google_cloud_run_v2_service" "api" {
  count    = var.api_image != "" ? 1 : 0
  name     = "aegis-api"
  location = var.region

  template {
    service_account = google_service_account.aegis.email

    scaling {
      min_instance_count = 0
      max_instance_count = 2
    }

    containers {
      image = var.api_image

      ports {
        container_port = 8080
      }

      resources {
        limits = {
          cpu    = "1"
          memory = var.api_memory
        }
      }

      env {
        name  = "PYTHONPATH"
        value = "/app/src:/app"
      }
      env {
        name  = "GCP_PROJECT_ID"
        value = var.project_id
      }
      env {
        name  = "GCS_BUCKET"
        value = google_storage_bucket.uploads.name
      }
      env {
        name  = "FIRESTORE_DATABASE"
        value = google_firestore_database.aegis.name
      }
      env {
        name  = "GOOGLE_API_KEY"
        value = var.google_api_key
      }
    }
  }

  depends_on = [
    google_project_service.apis["run.googleapis.com"],
    google_artifact_registry_repository.aegis,
  ]
}

# Allow unauthenticated access (public API for judges)
resource "google_cloud_run_v2_service_iam_member" "api_public" {
  count    = var.api_image != "" ? 1 : 0
  project  = var.project_id
  location = var.region
  name     = google_cloud_run_v2_service.api[0].name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# ──────────────────────────────────────────────────────────────
# 7. Cloud Run — Worker
# ──────────────────────────────────────────────────────────────

resource "google_cloud_run_v2_service" "worker" {
  count    = var.worker_image != "" ? 1 : 0
  name     = "aegis-worker"
  location = var.region

  template {
    service_account = google_service_account.aegis.email

    scaling {
      min_instance_count = 0
      max_instance_count = 1
    }

    containers {
      image = var.worker_image

      resources {
        limits = {
          cpu    = "1"
          memory = var.worker_memory
        }
      }

      env {
        name  = "PYTHONPATH"
        value = "/app/src:/app"
      }
      env {
        name  = "GCP_PROJECT_ID"
        value = var.project_id
      }
      env {
        name  = "GCS_BUCKET"
        value = google_storage_bucket.uploads.name
      }
      env {
        name  = "FIRESTORE_DATABASE"
        value = google_firestore_database.aegis.name
      }
      env {
        name  = "GOOGLE_API_KEY"
        value = var.google_api_key
      }
    }
  }

  depends_on = [
    google_project_service.apis["run.googleapis.com"],
    google_artifact_registry_repository.aegis,
  ]
}

# ──────────────────────────────────────────────────────────────
# 8. Cloud Run — Web (Next.js Frontend)
# ──────────────────────────────────────────────────────────────

resource "google_cloud_run_v2_service" "web" {
  count    = var.web_image != "" ? 1 : 0
  name     = "aegis-web"
  location = var.region

  template {
    scaling {
      min_instance_count = 0
      max_instance_count = 2
    }

    containers {
      image = var.web_image

      ports {
        container_port = 3000
      }

      resources {
        limits = {
          cpu    = "1"
          memory = var.web_memory
        }
      }

      env {
        name  = "NEXT_PUBLIC_API_URL"
        value = var.api_image != "" ? google_cloud_run_v2_service.api[0].uri : ""
      }
    }
  }

  depends_on = [
    google_project_service.apis["run.googleapis.com"],
    google_artifact_registry_repository.aegis,
  ]
}

# Allow unauthenticated access (public frontend)
resource "google_cloud_run_v2_service_iam_member" "web_public" {
  count    = var.web_image != "" ? 1 : 0
  project  = var.project_id
  location = var.region
  name     = google_cloud_run_v2_service.web[0].name
  role     = "roles/run.invoker"
  member   = "allUsers"
}
