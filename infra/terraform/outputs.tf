# ──────────────────────────────────────────────────────────────
# AEGIS — Terraform Outputs
# ──────────────────────────────────────────────────────────────

output "service_account_email" {
  description = "AEGIS runtime service account"
  value       = google_service_account.aegis.email
}

output "artifact_registry_url" {
  description = "Docker registry URL for pushing images"
  value       = "${var.region}-docker.pkg.dev/${var.project_id}/${var.registry_name}"
}

output "firestore_database" {
  description = "Firestore database name"
  value       = google_firestore_database.aegis.name
}

output "uploads_bucket" {
  description = "GCS bucket for document uploads"
  value       = google_storage_bucket.uploads.name
}

output "api_url" {
  description = "Public URL of the AEGIS API"
  value       = var.api_image != "" ? google_cloud_run_v2_service.api[0].uri : "(not deployed yet — set api_image)"
}

output "worker_url" {
  description = "URL of the AEGIS Worker"
  value       = var.worker_image != "" ? google_cloud_run_v2_service.worker[0].uri : "(not deployed yet — set worker_image)"
}

output "web_url" {
  description = "Public URL of the AEGIS Web frontend"
  value       = var.web_image != "" ? google_cloud_run_v2_service.web[0].uri : "(not deployed yet — set web_image)"
}

output "deploy_commands" {
  description = "Commands to build and push images after terraform apply"
  value       = <<-EOT

    # 1. Authenticate Docker with Artifact Registry
    gcloud auth configure-docker ${var.region}-docker.pkg.dev

    # 2. Build and push API
    docker build -f infra/docker/api.Dockerfile -t ${var.region}-docker.pkg.dev/${var.project_id}/${var.registry_name}/api:latest .
    docker push ${var.region}-docker.pkg.dev/${var.project_id}/${var.registry_name}/api:latest

    # 3. Build and push Worker
    docker build -f infra/docker/worker.Dockerfile -t ${var.region}-docker.pkg.dev/${var.project_id}/${var.registry_name}/worker:latest .
    docker push ${var.region}-docker.pkg.dev/${var.project_id}/${var.registry_name}/worker:latest

    # 4. Build and push Web (Next.js)
    docker build -f infra/docker/web.Dockerfile -t ${var.region}-docker.pkg.dev/${var.project_id}/${var.registry_name}/web:latest .
    docker push ${var.region}-docker.pkg.dev/${var.project_id}/${var.registry_name}/web:latest

    # 5. Update terraform.tfvars with image URIs and re-apply
    # api_image    = "${var.region}-docker.pkg.dev/${var.project_id}/${var.registry_name}/api:latest"
    # worker_image = "${var.region}-docker.pkg.dev/${var.project_id}/${var.registry_name}/worker:latest"
    # web_image    = "${var.region}-docker.pkg.dev/${var.project_id}/${var.registry_name}/web:latest"

    cd infra/terraform && terraform apply

  EOT
}
