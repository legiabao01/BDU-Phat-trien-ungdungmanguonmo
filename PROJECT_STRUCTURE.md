# 📁 Cấu trúc dự án

## Cấu trúc hiện tại (đã dọn dẹp)

```
BDU-Phat-trien-ungdungmanguonmo/
├── fastapi_app/              # Backend FastAPI
│   ├── main.py              # Entry point
│   ├── requirements.txt     # Python dependencies
│   ├── env.example          # Mẫu file .env
│   ├── run.ps1 / run.bat    # Script chạy backend
│   ├── core/                # Config, security
│   ├── db/                  # Database session
│   ├── models/              # SQLAlchemy models
│   ├── schemas/             # Pydantic schemas
│   └── api/routes/          # API endpoints
│
├── frontend/                 # Frontend React
│   ├── src/
│   │   ├── pages/           # Page components
│   │   ├── components/      # Reusable components
│   │   ├── context/         # Context API (Auth)
│   │   └── styles/          # CSS files
│   ├── package.json
│   └── vite.config.js
│
├── database/                 # SQL scripts
│   ├── schema_pg.sql        # PostgreSQL schema
│   ├── create_enrollment_table.sql
│   └── seed_programming_courses_fixed_utf8.sql
│
├── docs/                     # Documentation
│   ├── yêu-cầu.txt          # Yêu cầu dự án
│   └── SETUP.md             # Hướng dẫn setup
│
├── static/                   # Static files (uploads)
│   └── uploads/             # Uploaded files
│
├── scripts/                  # Utility scripts
│   ├── setup-database.ps1   # Auto setup database
│   ├── start-dev.ps1        # Run both servers
│   ├── start-dev.bat        # Run both servers (CMD)
│   └── run-sql.ps1          # Run SQL files
│
├── README.md                 # File này
├── .gitignore
└── venv/                    # Python virtual environment
```

## File đã xóa (Flask legacy)

- ❌ `app.py` - Flask app cũ
- ❌ `requirements.txt` (root) - Flask dependencies
- ❌ `templates/` - Flask Jinja2 templates
- ❌ `static/css/`, `static/js/` - Đã migrate vào frontend
- ❌ `database/schema.sql` - MySQL schema (legacy)
- ❌ `init_db.py` - Flask database init

## File giữ lại

- ✅ `fastapi_app/` - Toàn bộ backend
- ✅ `frontend/` - Toàn bộ frontend
- ✅ `database/` - Chỉ giữ PostgreSQL files
- ✅ `static/uploads/` - Uploaded files
- ✅ Scripts utility
- ✅ `docs/` - Documentation

