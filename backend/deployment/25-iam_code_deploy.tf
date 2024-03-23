resource "aws_iam_role" "code_deploy_iam_role" {
  name = var.code_deploy_role_name
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "codedeploy.amazonaws.com"
        }
      }
    ]
  })
}
# Fix this: The IAM role arn:aws:iam::339713048139:role/socialapp-server-codedeploy-role does not give you permission to perform operations in the following AWS service: AmazonAutoScaling. Contact your AWS administrator if you need help. If you are an AWS administrator, you can grant permissions to your users or groups by creating IAM policies.
resource "aws_iam_policy" "autoscaling_policy" {
  name        = "AutoScalingPolicy"
  description = "IAM policy for Amazon Auto Scaling"
  policy      = jsonencode({
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "iam:PassRole",
                "ec2:RunInstances"
            ],
            "Resource": "*"
        }
    ]
})
}

resource "aws_iam_role_policy_attachment" "autoscaling_policy" {
  policy_arn = aws_iam_policy.autoscaling_policy.arn
  role       = aws_iam_role.code_deploy_iam_role.name
}

resource "aws_iam_role_policy_attachment" "AWSCodeDeployRole" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSCodeDeployRole"
  role       = aws_iam_role.code_deploy_iam_role.name
}
