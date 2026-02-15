# 🚚 Logistics API — Sistema de Gestión de Envíos

API REST construida con **NestJS**, **arquitectura hexagonal**, **PostgreSQL** (usuarios y paquetes) y **MongoDB** (seguimiento).

---

## 📋 Decisiones de Diseño

### Historias de Usuario — Priorización MVP

| # | Historia | Estado | Prioridad | Criterio |
|---|----------|--------|-----------|----------|
| 1 | Iniciar sesión (JWT) | ✅ Completada | Alta | Desbloquea todo el resto |
| 2 | Crear usuario (admin) | ✅ Completada | Alta | Base del sistema |
| 3 | Consultar datos de usuario | ✅ Completada | Alta | Necesaria para auth |
| 4 | Registrar paquete | ✅ Completada | Alta | Funcionalidad central |
| 5 | Consultar paquete | ✅ Completada | Alta | Funcionalidad central |
| 6 | Ver mis paquetes | ✅ Completada | Alta | UX básica |
| 7 | Actualizar estado paquete | ✅ Completada | Alta | Ciclo de vida del paquete |
| 8 | Registrar evento de seguimiento | ✅ Completada | Alta | Diferenciador del sistema |
| 9 | Consultar historial de paquete | ✅ Completada | Alta | Valor al usuario |
| 10 | Despliegue en Docker | ✅ Completada | Media | Facilita evaluación |
| 11 | Script backup automático | ✅ Completada | Media | Protección de datos |

**Todas las historias del backlog fueron implementadas.**

### Criterios de Priorización
1. **Desbloqueo de dependencias**: Auth primero porque todos los endpoints requieren JWT
2. **Flujo completo**: Usuario → Paquete → Seguimiento en orden lógico
3. **Valor de negocio**: El tracking MongoDB en alta prioridad por ser el diferenciador del sistema
4. **Infraestructura**: Docker y backup al final, no bloquean funcionalidad pero sí la entrega

### Posibles Mejoras
- Paginación en listados de paquetes y usuarios
- Notificaciones push/email al actualizar estado de paquete
- Roles más granulares (ej: `dispatcher`, `courier`)
- Rate limiting por usuario
- Soft delete de usuarios y paquetes
- Endpoint público para tracking sin autenticación (solo con código de rastreo)
- Métricas y health check (`/health`)

---

## 🏗️ Arquitectura

```
src/
├── modules/
│   ├── auth/               # Autenticación JWT
│   ├── users/              # Gestión de usuarios (PostgreSQL)
│   ├── packages/           # Gestión de paquetes (PostgreSQL)
│   └── tracking/           # Eventos de seguimiento (MongoDB)
│       ├── domain/         # Entidades y puertos (interfaces)
│       ├── application/    # Casos de uso y DTOs
│       └── infrastructure/ # Controladores y repositorios
├── shared/                 # Filtros, interceptores globales
└── config/                 # Configuración centralizada
```

Cada módulo sigue **arquitectura hexagonal (Ports & Adapters)**:
- **Domain**: Entidades puras sin dependencias de frameworks
- **Application**: Casos de uso que orquestan la lógica de negocio
- **Infrastructure**: Implementaciones concretas (TypeORM, Mongoose, HTTP)

---

## 🔌 Endpoints

### Auth
| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | `/api/v1/auth/login` | Iniciar sesión | ❌ |

### Users
| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | `/api/v1/users` | Crear usuario | Admin |
| GET | `/api/v1/users` | Listar usuarios | Admin |
| GET | `/api/v1/users/:id` | Obtener usuario | Admin / propio |
| PATCH | `/api/v1/users/:id` | Actualizar usuario | Admin |

### Packages
| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | `/api/v1/packages` | Registrar paquete | User/Admin |
| GET | `/api/v1/packages` | Listar paquetes (admin: todos, user: propios) | User/Admin |
| GET | `/api/v1/packages/my` | Mis paquetes | User/Admin |
| GET | `/api/v1/packages/:id` | Detalle de paquete | Owner/Admin |
| GET | `/api/v1/packages/tracking/:code` | Buscar por código | User/Admin |
| PATCH | `/api/v1/packages/:id/status` | Actualizar estado | Admin |

### Tracking
| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | `/api/v1/packages/:packageId/tracking` | Registrar evento | User/Admin |
| GET | `/api/v1/packages/:packageId/tracking` | Historial completo | User/Admin |

---

## 🚀 Instalación y Ejecución

### Opción 1: Docker (recomendado)

**Prerrequisitos**: Docker y Docker Compose instalados.

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/logistics-api.git
cd logistics-api

# 2. Levantar todos los servicios (API + PostgreSQL + MongoDB)
docker-compose up -d

# La API estará disponible en http://localhost:3000/api/v1
# Swagger en http://localhost:3000/api/docs
```

Para detener:
```bash
docker-compose down
```

Para borrar volúmenes (reset completo):
```bash
docker-compose down -v
```

---

## 🧪 Tests

```bash
# Correr todos los tests unitarios
npm test

# Con cobertura
npm run test:cov

# En modo watch
npm run test:watch
```

---

## 💾 Backup de Bases de Datos

```bash
# Dar permisos de ejecución
chmod +x scripts/backup.sh

# Ejecutar backup manual
bash scripts/backup.sh

# Configurar backup automático diario (crontab)
# Ejecutar: crontab -e
# Agregar línea:
0 2 * * * /ruta/al/proyecto/scripts/backup.sh >> /var/log/logistics-backup.log 2>&1
```

Los backups se guardan en `./backups/YYYY-MM-DD/` y se limpian automáticamente después de 7 días.

---

## 📖 Documentación Swagger

Con el proyecto corriendo, visita:

```
http://localhost:3000/api/docs
```

Para probar endpoints protegidos:
1. Usa `POST /api/v1/auth/login` para obtener el token
2. Haz clic en **"Authorize"** (ícono del candado)
3. Ingresa: `Bearer <tu_token>`

---

## 🌱 Usuario Admin Inicial

Para crear el primer administrador, puedes hacer una llamada directa a la base de datos o temporalmente cambiar el guard del endpoint `POST /users` para permitir la primera creación. Una vez creado, usa sus credenciales para crear más usuarios.

**Ejemplo de creación directa en PostgreSQL**:
```sql
INSERT INTO users (id, name, email, password, role, status, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Admin',
  'admin@logistics.com',
  -- bcrypt hash de 'Admin123!' (10 rounds)
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'admin',
  'active',
  NOW(),
  NOW()
);
```

---

## ⚙️ Variables de Entorno

| Variable | Descripción | Default |
|----------|-------------|---------|
| `PORT` | Puerto de la API | `3000` |
| `NODE_ENV` | Entorno | `development` |
| `POSTGRES_HOST` | Host PostgreSQL | `localhost` |
| `POSTGRES_PORT` | Puerto PostgreSQL | `5432` |
| `POSTGRES_USER` | Usuario BD | `logistics_user` |
| `POSTGRES_PASSWORD` | Contraseña BD | `logistics_pass` |
| `POSTGRES_DB` | Nombre BD | `logistics_db` |
| `MONGODB_URI` | URI de MongoDB | `mongodb://localhost:27017/logistics_tracking` |
| `JWT_SECRET` | Clave secreta JWT | ⚠️ Cambiar en producción |
| `JWT_EXPIRES_IN` | Expiración del token | `7d` |

---

## 📦 Stack Tecnológico

- **Framework**: NestJS 10
- **Base de datos SQL**: PostgreSQL 15 + TypeORM
- **Base de datos NoSQL**: MongoDB 7 + Mongoose
- **Autenticación**: JWT (passport-jwt)
- **Validación**: class-validator + class-transformer
- **Documentación**: Swagger (@nestjs/swagger)
- **Contenedores**: Docker + Docker Compose
- **Tests**: Jest
- **Arquitectura**: Hexagonal (Ports & Adapters)
