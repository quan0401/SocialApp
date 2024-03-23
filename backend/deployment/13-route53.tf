# data to get available resource
# Get already hosted
data "aws_route53_zone" "main" {
  name         = var.main_api_server_domain
  private_zone = false
}
