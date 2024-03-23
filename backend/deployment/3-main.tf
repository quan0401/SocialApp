terraform {
  backend "s3" {
    bucket  = "social-app-terraform-state"
    key     = "staging/socialapp.tfstate" # find staging folder in s3 bucket then create socialapp.tfstate file
    region  = "ap-southeast-1"
    encrypt = true
  }
}

locals {
  prefix = "${var.prefix}-${terraform.workspace}"
  common_tags = {
    Service   = terraform.workspace
    Project   = var.project
    ManagedBy = "Terraform"
    Owner     = "Dong Minh Quan"
  }
}
