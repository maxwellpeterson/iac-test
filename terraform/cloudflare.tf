terraform {
  required_providers {
    cloudflare = {
      source = "cloudflare/cloudflare"
      // Problem! Docs had this at version 4:
      // https://developers.cloudflare.com/terraform/tutorial/initialize-terraform/#1-define-your-first-terraform-config-file
      version = "~> 5"
    }
  }
}

variable "account_id" {
  default = "f1f050202632dd27369847f0af466a40"
}

variable "cloudflare_api_token" {
  type = string
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

resource "cloudflare_r2_bucket" "max_terraform_test_bucket" {
  // Why?
  account_id = var.account_id
  name = "max-terraform-test"
}

resource "cloudflare_workers_script" "max_terraform_test_worker" {
  // Why?
  account_id = var.account_id
  script_name = "max-terraform-test"
  // Problem! Content field missing from:
  // https://registry.terraform.io/providers/cloudflare/cloudflare/latest/docs/resources/workers_script#example-usage
  content = file("build/index.js")
  # Error! Don't want this...
  # metadata = {
    bindings = [{
      name = "BUCKET"
      // What are the options???
      // https://developers.cloudflare.com/workers/configuration/multipart-upload-metadata/#bindings
      type = "r2_bucket"
      bucket_name = cloudflare_r2_bucket.max_terraform_test_bucket.name

    }]
    # Don't want to use service worker syntax...
    # body_part = "worker.js"

    # Updating compat date makes Terraform delete worker and re-create from
    # scratch. After re-creation the subdomain is inactive...
    // The message:
    //       ~ id                  = "max-terraform-test" -> (known after apply) # forces replacement
    // This is wrong:
    // https://registry.terraform.io/providers/cloudflare/cloudflare/latest/docs/resources/workers_script#id-4
    compatibility_date = "2024-01-01"
    # compatibility_flags = ["nodejs_compat"]
    // Does this matter??
    main_module = "worker.js"
    # Error! Don't want this...
    # tags = ["string"]
  # }
}

resource "cloudflare_workers_script_subdomain" "max_terraform_test_subdomain" {
  account_id = var.account_id
  script_name = cloudflare_workers_script.max_terraform_test_worker.script_name
  enabled = true
}