---
description: "Use when: working on this repo in Antigravity or any editor without VS Code Copilot; follow the same project rules and update context as changes are made."
applyTo: "**/*"
---

# Instrucciones para Antigravity (sin Copilot)

Siempre lee y respeta los requisitos del proyecto en docs/statement.md y .github/copilot-instructions.md.

## Reglas base
- Backend: Node.js con Express.
- Frontend: React SPA.
- Base de datos: PostgreSQL o MySQL; en produccion debe ser RDS.
- AWS SDK: v3 para Node.js.
- Variables de entorno obligatorias; nunca hardcodear credenciales.
- Contrasenas en BD: almacenar con MD5.

## Contexto vivo
- Cada vez que se agregue o cambie infraestructura, rutas, modelos o servicios AWS, actualizar la documentacion relevante y el contexto en .github/copilot-instructions.md.

## Buenas practicas
- Codigo modular y limpio, con manejo de errores con try/catch y HTTP status correctos.
- Mantener consistencia con docker-compose.yml y .env.
