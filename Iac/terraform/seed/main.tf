# Data ----------------------
data "aws_ami" "ubuntu" {
  most_recent = true
  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*"]
  }
  owners = ["099720109477"]
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
resource "aws_security_group" "Server_SG" {
  name        = "Server_SG"
  description = "Allows SSH and Server Port"
  vpc_id      = data.aws_vpc.default.id


  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "Allow all outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "Server_SG"
  }
}

resource "aws_security_group" "DB_SG" {
  name   = "DB_SG"
  vpc_id = data.aws_vpc.default.id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.Server_SG.id]
  }

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "Allow all outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "DB_SG"
  }
}

# S3 ----------------------
resource "aws_s3_bucket" "frontend_bucket" {
  bucket = var.S3_NAME
}
resource "aws_s3_bucket_website_configuration" "hosting" {
  bucket = aws_s3_bucket.frontend_bucket.id

  index_document {
    suffix = "index.html"
  }
  error_document {
    key = "index.html" #En el caso de React, si fuera con next, seria el error.html
  }
}
resource "aws_s3_bucket_public_access_block" "public_access" {
  bucket                  = aws_s3_bucket.frontend_bucket.id
  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}
resource "aws_s3_bucket_policy" "allow_public_access" {
  bucket = aws_s3_bucket.frontend_bucket.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.frontend_bucket.arn}/*"
      },
    ]
  })
}

# EC2 ----------------------
resource "aws_instance" "Server_vm" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = "t2.micro"
  key_name               = "Semis1_keys"
  vpc_security_group_ids = [aws_security_group.Server_SG.id]
  subnet_id              = data.aws_subnets.default.ids[0]

  tags = {
    Name = "Server_vm"
  }
}

# RDS ----------------------
resource "aws_db_subnet_group" "default" {
  name       = "main-subnet-group"
  subnet_ids = data.aws_subnets.default.ids

  tags = {
    Name = "DB Subnet Group"
  }
}

resource "aws_db_instance" "db" {
  allocated_storage     = 20
  max_allocated_storage = 30
  identifier            = "server-db"
  #   engine                = "postgres" 
  #   engine_version = "17.2"
  instance_class = "db.t3.micro"
  # Comentado por usar una snapshot
  #   username = var.db_username
  #   password = var.db_password
  #   db_name  = "semisocial_db"

  db_subnet_group_name   = aws_db_subnet_group.default.name
  vpc_security_group_ids = [aws_security_group.DB_SG.id]
  #   parameter_group_name   = "default.postgres17"

  publicly_accessible = true

  snapshot_identifier       = "database-1-snapshot"
  skip_final_snapshot       = false
  final_snapshot_identifier = "database-1-snapshot-v2"
}
