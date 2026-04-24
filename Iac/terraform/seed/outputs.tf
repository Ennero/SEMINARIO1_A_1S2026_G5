output "CLIENT_URL" {
  value = aws_s3_bucket_website_configuration.hosting.website_endpoint
}
output "DB_HOST" {
  value = aws_db_instance.db.address
}
output "VITE_API_URL" {
  value = aws_instance.Server_vm.public_ip
}
# terraform output -json > ../../ansible/controller/vars.json
