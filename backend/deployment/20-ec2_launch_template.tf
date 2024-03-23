resource "aws_launch_template" "asg_launch_template" {
  name          = "${local.prefix}-launch_template"
  image_id      = data.aws_ami.ec2_ami.id
  instance_type = var.ec2_instance_type
  key_name      = "socialappKeyPair"
  iam_instance_profile {
    name = aws_iam_instance_profile.ec2_instance_profile.name
  }
  network_interfaces {
    security_groups = [aws_security_group.autoscaling_group_sg.id]
    associate_public_ip_address = false
  }
  user_data = filebase64("${path.module}/userdata/user-data.sh")

  lifecycle {
    create_before_destroy = true
  }
}
