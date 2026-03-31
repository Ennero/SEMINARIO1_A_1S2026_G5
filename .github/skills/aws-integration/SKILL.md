---
name: aws-integration
description: "Use when: implementing or wiring AWS SDK v3 services (S3, Cognito, Rekognition, Translate, Lex, Lambda, API Gateway) or validating required env vars."
---

# AWS Integration Skill

## Goals
- Use AWS SDK v3 for all integrations.
- Read credentials and settings from environment variables.
- Keep bucket names and service identifiers aligned with project requirements.

## Checklist
- Use @aws-sdk/client-* packages (v3).
- No hardcoded credentials; use process.env.
- S3 bucket for images: semi1proyecto-g6.
- Static web bucket: Proyecto-Web-G6.
- Cognito must include email verification.
- Rekognition for labels and face login.
- Translate for post/comment translations.
- Lex for faculty chatbot.
