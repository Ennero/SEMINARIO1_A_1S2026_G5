# Data ----------------------

data "aws_instance" "backend_ec2" {
  filter {
    name   = "tag:Name"
    values = ["Server_vm"]
  }
  #   filter {
  #     name   = "instance-state-name"
  #     values = ["running", "stopped"]
  #   }
}
data "aws_security_group" "backend_SG" {
  filter {
    name   = "tag:Name"
    values = ["Server_SG"]
  }
}
data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

# SG ----------------------
resource "aws_security_group" "alb-SG" {
  name   = "alb-SG"
  vpc_id = data.aws_vpc.default.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "alb-SG"
  }
}
# AMI ----------------------
resource "aws_ami_from_instance" "backend_ami" {
  name                    = "backend_ami"
  source_instance_id      = data.aws_instance.backend_ec2.id
  snapshot_without_reboot = true #Si se pone en false, reinicia la VM cuando saca la AMI

  tags = {
    Name = "backend_ami"
  }
}
# Template ----------------------
resource "aws_launch_template" "backend_LT" {
  name_prefix   = "backend-template-"
  image_id      = aws_ami_from_instance.backend_ami.id
  instance_type = "t2.micro"
  key_name      = "Semis1_keys"

  network_interfaces {
    associate_public_ip_address = true
    security_groups             = [data.aws_security_group.backend_SG.id]
  }

  tag_specifications {
    resource_type = "instance"
    tags = {
      Name = "backend_LT"
    }
  }
  lifecycle {
    create_before_destroy = true
  }
}

# TG ----------------------
resource "aws_lb_target_group" "backend_TG" {
  name     = "backend-TG"
  port     = 80
  protocol = "HTTP"
  vpc_id   = data.aws_vpc.default.id

  health_check {
    path                = "/api/health"
    enabled             = true
    interval            = 15
    protocol            = "HTTP"
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 2
  }

  tags = {
    "Name" = "backend_TG"
  }
}

resource "aws_autoscaling_group" "backend_ASG" {
  name             = "backend_ASG"
  desired_capacity = 2
  max_size         = 4
  min_size         = 1

  launch_template {
    id      = aws_launch_template.backend_LT.id
    version = "$Latest"
  }

  vpc_zone_identifier       = data.aws_subnets.default.ids
  health_check_type         = "ELB"
  health_check_grace_period = 120

  target_group_arns = [aws_lb_target_group.backend_TG.arn]
  tag {
    key                 = "Name"
    value               = "asg-instance"
    propagate_at_launch = true
  }
}

# ALB ----------------------
resource "aws_alb" "ALB-Semis1" {
  name               = "ALB-Semis1"
  ip_address_type    = "ipv4"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb-SG.id]
  subnets            = data.aws_subnets.default.ids
  idle_timeout       = 3600
  tags = {
    "Name" = "ALB-Semis1"
  }
}

## Listeners
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_alb.ALB-Semis1.arn
  port              = 80
  protocol          = "HTTP"
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend_TG.arn
  }
}

resource "aws_lb_listener_rule" "socket_io" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 10
  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend_TG.arn

    forward {
      target_group {
        arn    = aws_lb_target_group.backend_TG.arn
        weight = 1
      }
      stickiness {
        enabled  = true
        duration = 3600
      }
    }
  }
  condition {
    path_pattern {
      values = ["/socket.io/*"]
    }
  }
}





