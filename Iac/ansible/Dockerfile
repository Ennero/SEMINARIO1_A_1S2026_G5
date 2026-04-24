FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

# Instalaciones para el sistema
RUN apt-get update && apt-get upgrade -y && \
    apt-get install -y --no-install-recommends \
    software-properties-common \
    openssh-client \
    curl \
    git \
    unzip \
    python3 \
    python3-pip \
    libpq-dev \
    gcc \
    python3-dev \
    postgresql-client && \
    rm -rf /var/lib/apt/lists/*

# Instalaciones de python
RUN pip3 install --no-cache-dir \
    ansible \
    boto3 \
    psycopg2-binary

# Libreria para que ansible se comunique con postgrs
RUN ansible-galaxy collection install community.postgresql amazon.aws

WORKDIR /infra