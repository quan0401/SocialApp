resource "aws_s3_bucket" "code_deploy_backend_bucket" {
  bucket = "${local.prefix}-app"
  force_destroy = true

  tags = local.common_tags
}

resource "aws_s3_bucket_ownership_controls" "code_deploy_bucket_ownershil_ctrls" {
  bucket = aws_s3_bucket.code_deploy_backend_bucket.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_acl" "code_deploy_bucket_acl" {
  depends_on = [ aws_s3_bucket_ownership_controls.code_deploy_bucket_ownershil_ctrls ]

  bucket = aws_s3_bucket.code_deploy_backend_bucket.id
  acl    = "private"
}


resource "aws_s3_bucket_public_access_block" "public_block" {
  bucket = aws_s3_bucket.code_deploy_backend_bucket.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_versioning" "code_deploy_bucket_versioning" {
  bucket = aws_s3_bucket.code_deploy_backend_bucket.id
  versioning_configuration {
    status = "Enabled"
  }
}
