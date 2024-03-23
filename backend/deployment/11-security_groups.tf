resource "aws_security_group" "bastion_host_sg" {
  name        = "${local.prefix}-bastion_host_sg"
  description = "Allows SSH into bastion host instance"
  vpc_id      = aws_vpc.main.id
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "TCP"
    cidr_blocks = [var.bastion_host_cidr]
    description = "Allows SSH into bastion host instance"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = [var.global_destination_cidr_block]
  }

  tags = merge(
    local.common_tags,
    tomap({ "Name" = "${local.prefix}-bastion_host_sg" })
  )
}

resource "aws_security_group" "alb_sg" {
  name        = "${local.prefix}-alb_sg"
  description = "Allow traffic through the application load balancer"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "TCP"
    cidr_blocks = [var.global_destination_cidr_block]
    description = "Allows HTTP traffic to load balancer"
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "TCP"
    cidr_blocks = [var.global_destination_cidr_block]
    description = "Allows HTTPS traffic to load balancer"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = [var.global_destination_cidr_block]
  }

  tags = merge(
    local.common_tags,
    tomap({ "Name" = "${local.prefix}-alb_sg" })
  )
}

resource "aws_security_group" "autoscaling_group_sg" {
  name        = "${local.prefix}-autoscaling_group_sg"
  description = "Allows internet access for instances launched with ASG"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 80
    to_port         = 80
    protocol        = "TCP"
    security_groups = [aws_security_group.alb_sg.id]
    description     = "Allows HTTP traffic into webserver"
  }

  ingress {
    from_port       = 443
    to_port         = 443
    protocol        = "TCP"
    security_groups = [aws_security_group.alb_sg.id]
    description     = "Allows HTTPS traffic into webserver"
  }

  ingress {
    from_port       = 22
    to_port         = 22
    protocol        = "TCP"
    security_groups = [aws_security_group.bastion_host_sg.id]
    description     = "Allows access to webserver through bastion host"
  }

  ingress {
    from_port       = 5001
    to_port         = 5001
    protocol        = "TCP"
    security_groups = [aws_security_group.alb_sg.id]
    description     = "Allows access to webserver through ALB"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = [var.global_destination_cidr_block]
  }

  tags = merge(
    local.common_tags,
    tomap({ "Name" = "${local.prefix}-autoscaling_group_sg" })
  )
}

resource "aws_security_group" "elasticache_sg" {
  name        = "${local.prefix}-elasticache_sg"
  description = "Allows access to elasticache service"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "TCP"
    security_groups = [aws_security_group.bastion_host_sg.id]
    description     = "Allows access to redis server through bastion"
  }

  ingress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "TCP"
    security_groups = [aws_security_group.autoscaling_group_sg.id]
    description     = "Allows access to redis server throught ASG"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = [var.global_destination_cidr_block]
  }

  tags = merge(
    local.common_tags,
    tomap({ "Name" = "${local.prefix}-autoscaling_group_sg" })
  )

}

