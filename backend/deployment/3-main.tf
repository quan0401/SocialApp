terraform {
  backend "s3" {
    bucket  = "social-app-terraform-state"
    key     = "develop/socialapp.tfstate" # find develop folder in s3 bucket then create socialapp.tfstate file
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
