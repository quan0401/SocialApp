terraform {
  required_version = "~> 1.7.0" # atleast 1.2.0 version
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
  # you may provide access key here else it will access on the local machine
}
