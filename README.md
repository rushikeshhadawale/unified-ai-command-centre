
<img width="1919" height="1079" alt="image" src="https://github.com/user-attachments/assets/f42c970b-614a-42ec-b8fe-277f94aa7652" />
<img width="1919" height="1079" alt="image" src="https://github.com/user-attachments/assets/7816fd8e-5949-4d3e-92a7-83c6ad56c7a1" />
<img width="1919" height="1079" alt="image" src="https://github.com/user-attachments/assets/c5e3bc6c-aca6-4a6e-b0a4-f3c9e68c8dff" />
<img width="1919" height="1079" alt="image" src="https://github.com/user-attachments/assets/da9ed392-cccf-4c57-92ad-5fdec3819730" />

Unified AI Command Centre

A full-stack intelligent communication system that automates WhatsApp (text + voice), email notifications, workflow automation, and real-time conversational AI for employers and domestic workers.

Project Overview

The Unified AI Command Centre is a centralized operations dashboard that enables organizations to:

Send WhatsApp text, WhatsApp voice, and email notifications

Manage workflows like onboarding, salary reminders, document reminders

Track complete conversation history (Inbound + Outbound)

Detect language, intent, and sentiment from user replies

Auto-respond using rules or escalate to human operator

Provide a clean, modern admin UI for operations teams

The system supports 4 languages:

English

Hindi

Kannada

Nepali

🚀 Key Features
🔔 Notification Engine

WhatsApp Text (mock)

WhatsApp Voice (TTS simulated)

Email (mock SMTP)

JSON template variables (e.g., {name}, {salary_amount})

🤖 AI Layer

Language detection

Rule-based intent detection

Sentiment tagging

Auto replies (COMPLETION / CONFUSED / OPT_OUT)

🔄 Workflow Automation

Onboarding flow

Salary reminder flow

Document reminder flow

Multi-step workflow structure

Triggers: time-based, event-based, reply-based

🖥️ Admin Dashboard

Built using React:

Manage users

Create templates

Send notifications

Monitor conversations

Modern dark UI with cards, sidebar, and table views

🏗️ System Architecture
                ┌─────────────────────┐
                │   Admin Dashboard   │
                │       (React)       │
                └───────────┬─────────┘
                            │ REST API
                            ▼
                  ┌─────────────────────┐
                  │      Backend        │
                  │ (FastAPI + Python)  │
                  ├─────────────────────┤
                  │ Notification Engine │
                  │ Workflow Engine     │
                  │ AI Layer            │
                  └───────────┬─────────┘
                            │ DB ORM
                            ▼
                 ┌──────────────────────┐
                 │     PostgreSQL DB     │
                 └──────────────────────┘

🧰 Tech Stack
Frontend

React

React Router

Custom CSS (Tailwind-inspired)

Backend

Python

FastAPI

SQLAlchemy

Uvicorn

Mock WhatsApp + Email integrations

Mock TTS + ASR

Database

PostgreSQL
(SQLite also supported for local testing)

📁 Folder Structure
unified-ai-command-centre/
│
├── backend/
│   ├── main.py              # FastAPI app
│   ├── venv/                # Python environment
│   └── unified-ai-db.sqlite # Local DB (SQLite)
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── UsersPage.js
│   │   │   ├── TemplatesPage.js
│   │   │   ├── SendNotificationPage.js
│   │   │   └── ConversationsPage.js
│   │   ├── App.js
│   │   ├── api.js
│   │   └── index.js
│   ├── public/
│   └── package.json
│
└── README.md

⚙️ Setup Instructions
1️⃣ Backend Setup (FastAPI)
Step 1 – Navigate to backend folder
cd unified-ai-command-centre/backend

Step 2 – Create virtual environment
python -m venv venv

Step 3 – Activate venv

Windows:

venv\Scripts\activate

Step 4 – Install dependencies
pip install fastapi "uvicorn[standard]" sqlalchemy pydantic psycopg2-binary

Step 5 – Run Backend
python main.py


Backend will start at:

🔗 http://localhost:8000

🔗 API Docs: http://localhost:8000/docs

2️⃣ Frontend Setup (React)
Step 1 – Navigate to frontend
cd unified-ai-command-centre/frontend

Step 2 – Install dependencies
npm install

Step 3 – Start React app
npm start


Frontend runs at:

🔗 http://localhost:3000

🧪 Testing Webhooks (WhatsApp Reply Simulation)

Use cURL/Postman:

curl -X POST http://localhost:8000/webhook/whatsapp \
  -H "Content-Type: application/json" \
  -d '{
        "phone_number": "9999999999",
        "text": "done, payment ho gaya"
      }'


Backend auto-detects:

Language → Hindi

Intent → COMPLETION

Sentiment → POSITIVE

Auto reply: “Thanks, payment recorded”

View result in Conversations page.

📊 Database Schema Overview

Tables included:

users

templates

workflows

workflow_steps

workflow_instances

intents

notifications

conversations

Schema defined using SQLAlchemy ORM.

📸 Screenshots (Add Your Images Here)

Create a folder:

/screenshots


And upload:

Dashboard view

Users page

Templates page

Send Notification page

Conversations timeline

Then embed here:

![Dashboard](screenshots/dashboard.png)

📦 Deployment (Optional Future Work)

Deploy FastAPI to Render / Railway

Deploy React to Netlify / Vercel

Migrate DB to PostgreSQL cloud (Supabase)

Integrate real WhatsApp Cloud API

Integrate real Text-To-Speech + Speech-To-Text

🤝 Contributing

Pull Requests are welcome.
Please create a discussion before major changes.

📜 License

MIT License (or whatever license you choose)
