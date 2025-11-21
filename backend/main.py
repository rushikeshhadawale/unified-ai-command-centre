from fastapi import FastAPI, Depends, HTTPException, status, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta

from sqlalchemy import (
    create_engine, Column, Integer, String, DateTime, Boolean,
    ForeignKey, Text, Enum, JSON
)
from sqlalchemy.orm import sessionmaker, declarative_base, relationship, Session
import enum
import os

# =========================
# DATABASE SETUP
# =========================

# For PostgreSQL (for your report):
DATABASE_URL = "postgresql://username:password@localhost:5432/unified_ai_db"

# For quick local testing use SQLite:
DATABASE_URL = "sqlite:///./unified_ai_db.sqlite3"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# =========================
# ENUMS
# =========================

class UserType(str, enum.Enum):
    EMPLOYER = "EMPLOYER"
    MAID = "MAID"


class Channel(str, enum.Enum):
    WHATSAPP_TEXT = "WHATSAPP_TEXT"
    WHATSAPP_VOICE = "WHATSAPP_VOICE"
    EMAIL = "EMAIL"


class WorkflowStatus(str, enum.Enum):
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    PAUSED = "PAUSED"
    FAILED = "FAILED"


class Direction(str, enum.Enum):
    INBOUND = "INBOUND"
    OUTBOUND = "OUTBOUND"


class Sentiment(str, enum.Enum):
    POSITIVE = "POSITIVE"
    NEUTRAL = "NEUTRAL"
    NEGATIVE = "NEGATIVE"
    CONFUSED = "CONFUSED"


# =========================
# DATABASE MODELS
# =========================

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    phone_number = Column(String, unique=True, nullable=False)
    email = Column(String, nullable=True)
    user_type = Column(Enum(UserType), default=UserType.EMPLOYER, nullable=False)
    preferred_language = Column(String, default="en")
    status = Column(String, default="ACTIVE")
    created_at = Column(DateTime, default=datetime.utcnow)

    conversations = relationship("Conversation", back_populates="user")
    notifications = relationship("Notification", back_populates="user")
    workflow_instances = relationship("WorkflowInstance", back_populates="user")


class Template(Base):
    __tablename__ = "templates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    channel = Column(Enum(Channel), nullable=False)
    language = Column(String, nullable=False)
    body = Column(Text, nullable=False)  # "Hi {name}, salary {salary_amount} due on {due_date}"
    created_at = Column(DateTime, default=datetime.utcnow)


class Workflow(Base):
    __tablename__ = "workflows"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    type = Column(String, nullable=True)  # ONBOARDING, SALARY_REMINDER, DOC_REMINDER
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    steps = relationship("WorkflowStep", back_populates="workflow")
    instances = relationship("WorkflowInstance", back_populates="workflow")


class WorkflowStep(Base):
    __tablename__ = "workflow_steps"

    id = Column(Integer, primary_key=True, index=True)
    workflow_id = Column(Integer, ForeignKey("workflows.id"), nullable=False)
    step_order = Column(Integer, nullable=False)
    trigger_type = Column(String, default="TIME_BASED")  # TIME_BASED, EVENT_BASED, REPLY_BASED
    template_id = Column(Integer, ForeignKey("templates.id"), nullable=True)
    expected_intent = Column(String, nullable=True)  # e.g. "COMPLETION"
    next_step_on_success = Column(Integer, nullable=True)
    next_step_on_failure = Column(Integer, nullable=True)

    workflow = relationship("Workflow", back_populates="steps")
    template = relationship("Template")


class WorkflowInstance(Base):
    __tablename__ = "workflow_instances"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    workflow_id = Column(Integer, ForeignKey("workflows.id"), nullable=False)
    current_step_id = Column(Integer, ForeignKey("workflow_steps.id"), nullable=True)
    status = Column(Enum(WorkflowStatus), default=WorkflowStatus.IN_PROGRESS)
    started_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="workflow_instances")
    workflow = relationship("Workflow", back_populates="instances")
    current_step = relationship("WorkflowStep")


class Intent(Base):
    __tablename__ = "intents"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(Text, nullable=True)


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    workflow_instance_id = Column(Integer, ForeignKey("workflow_instances.id"), nullable=True)
    channel = Column(Enum(Channel), nullable=False)
    template_id = Column(Integer, ForeignKey("templates.id"), nullable=True)
    payload = Column(JSON, nullable=True)  # final text, subject, etc.
    status = Column(String, default="SENT")  # PENDING, SENT, DELIVERED, FAILED
    provider_message_id = Column(String, nullable=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    direction = Column(Enum(Direction), nullable=False)
    channel = Column(Enum(Channel), nullable=False)
    message_text = Column(Text, nullable=True)
    audio_url = Column(String, nullable=True)
    language = Column(String, nullable=True)
    intent_name = Column(String, nullable=True)
    sentiment = Column(Enum(Sentiment), default=Sentiment.NEUTRAL)
    timestamp = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="conversations")


# =========================
# Pydantic Schemas
# =========================

class UserCreate(BaseModel):
    name: str
    phone_number: str
    email: Optional[str] = None
    user_type: UserType = UserType.EMPLOYER
    preferred_language: str = "en"


class UserOut(BaseModel):
    id: int
    name: str
    phone_number: str
    email: Optional[str]
    user_type: UserType
    preferred_language: str
    status: str

    class Config:
        orm_mode = True


class TemplateCreate(BaseModel):
    name: str
    channel: Channel
    language: str
    body: str


class TemplateOut(BaseModel):
    id: int
    name: str
    channel: Channel
    language: str
    body: str

    class Config:
        orm_mode = True


class WorkflowCreate(BaseModel):
    name: str
    description: Optional[str] = None
    type: Optional[str] = None


class WorkflowOut(BaseModel):
    id: int
    name: str
    description: Optional[str]
    type: Optional[str]
    is_active: bool

    class Config:
        orm_mode = True


class WorkflowStepCreate(BaseModel):
    workflow_id: int
    step_order: int
    trigger_type: str = "TIME_BASED"
    template_id: Optional[int] = None
    expected_intent: Optional[str] = None
    next_step_on_success: Optional[int] = None
    next_step_on_failure: Optional[int] = None


class NotificationSendRequest(BaseModel):
    channel: Channel
    user_ids: List[int]
    template_id: int
    variables: Dict[str, Any] = {}


class ConversationOut(BaseModel):
    id: int
    user_id: int
    direction: Direction
    channel: Channel
    message_text: Optional[str]
    audio_url: Optional[str]
    language: Optional[str]
    intent_name: Optional[str]
    sentiment: Sentiment
    timestamp: datetime

    class Config:
        orm_mode = True


class WhatsAppWebhookPayload(BaseModel):
    phone_number: str
    text: Optional[str] = None
    audio_url: Optional[str] = None


# =========================
# MOCK SERVICES (WhatsApp, Email, TTS, ASR, AI)
# =========================

def mock_send_whatsapp_text(phone: str, text: str) -> str:
    # In real life, call provider API
    print(f"[MOCK] WhatsApp TEXT to {phone}: {text}")
    return "mock-whatsapp-text-id"


def mock_send_whatsapp_voice(phone: str, audio_url: str) -> str:
    print(f"[MOCK] WhatsApp VOICE to {phone}: {audio_url}")
    return "mock-whatsapp-voice-id"


def mock_send_email(email: str, subject: str, body: str) -> str:
    print(f"[MOCK] EMAIL to {email}: {subject} - {body[:60]}...")
    return "mock-email-id"


def mock_tts_generate(text: str, language: str) -> str:
    # Pretend to generate audio and return URL
    return f"https://example.com/audio/{language}/{hash(text)}.mp3"


def mock_asr_transcribe(audio_url: str) -> str:
    # Pretend ASR: in real app call speech-to-text API
    return "Dummy transcribed text from audio."


def detect_language(text: str) -> str:
    text_lower = text.lower()
    if any(word in text_lower for word in ["hai", "kya", "aap", "nahi"]):
        return "hi"  # Hindi
    if any(word in text_lower for word in ["ಹೌದು", "illa", "madiddini"]):
        return "kn"
    if any(word in text_lower for word in ["ho", "gary", "bhayo"]):
        return "ne"
    return "en"


def predict_intent(text: str) -> str:
    t = text.lower()
    if any(x in t for x in ["done", "paid", "complete", "madiddini", "ho", "hogaya", "हो गया"]):
        return "COMPLETION"
    if any(x in t for x in ["upi", "gpay", "phonepe"]):
        return "UPI_QUERY"
    if any(x in t for x in ["stop", "unsubscribe", "mat bhejo"]):
        return "OPT_OUT"
    if any(x in t for x in ["dont understand", "samajh", "confuse", "kya karna"]):
        return "CONFUSED"
    return "GENERAL_QUERY"


def detect_sentiment(text: str) -> Sentiment:
    t = text.lower()
    if any(x in t for x in ["thanks", "thank you", "great", "good", "dhanyavad"]):
        return Sentiment.POSITIVE
    if any(x in t for x in ["bad", "angry", "worst", "sad"]):
        return Sentiment.NEGATIVE
    if any(x in t for x in ["confuse", "samajh nahi", "dont understand"]):
        return Sentiment.CONFUSED
    return Sentiment.NEUTRAL


# =========================
# FastAPI APP
# =========================

app = FastAPI(title="Unified AI Command Centre")

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # in real life, restrict
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================
# STARTUP – CREATE TABLES
# =========================

@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)


# =========================
# USERS
# =========================

@app.post("/users", response_model=UserOut)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = User(
        name=user.name,
        phone_number=user.phone_number,
        email=user.email,
        user_type=user.user_type,
        preferred_language=user.preferred_language,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@app.get("/users", response_model=List[UserOut])
def list_users(db: Session = Depends(get_db)):
    return db.query(User).all()


# =========================
# TEMPLATES
# =========================

@app.post("/templates", response_model=TemplateOut)
def create_template(template: TemplateCreate, db: Session = Depends(get_db)):
    db_tmpl = Template(
        name=template.name,
        channel=template.channel,
        language=template.language,
        body=template.body,
    )
    db.add(db_tmpl)
    db.commit()
    db.refresh(db_tmpl)
    return db_tmpl


@app.get("/templates", response_model=List[TemplateOut])
def list_templates(db: Session = Depends(get_db)):
    return db.query(Template).all()


# =========================
# WORKFLOWS & STEPS
# =========================

@app.post("/workflows", response_model=WorkflowOut)
def create_workflow(wf: WorkflowCreate, db: Session = Depends(get_db)):
    db_wf = Workflow(
        name=wf.name,
        description=wf.description,
        type=wf.type,
    )
    db.add(db_wf)
    db.commit()
    db.refresh(db_wf)
    return db_wf


@app.get("/workflows", response_model=List[WorkflowOut])
def list_workflows(db: Session = Depends(get_db)):
    return db.query(Workflow).all()


@app.post("/workflow-steps")
def create_workflow_step(step: WorkflowStepCreate, db: Session = Depends(get_db)):
    wf = db.query(Workflow).filter(Workflow.id == step.workflow_id).first()
    if not wf:
        raise HTTPException(status_code=404, detail="Workflow not found")

    db_step = WorkflowStep(
        workflow_id=step.workflow_id,
        step_order=step.step_order,
        trigger_type=step.trigger_type,
        template_id=step.template_id,
        expected_intent=step.expected_intent,
        next_step_on_success=step.next_step_on_success,
        next_step_on_failure=step.next_step_on_failure,
    )
    db.add(db_step)
    db.commit()
    db.refresh(db_step)
    return {"id": db_step.id, "message": "Step created"}


# =========================
# NOTIFICATIONS – SEND
# =========================

def render_template(body: str, variables: Dict[str, Any]) -> str:
    text = body
    for key, value in variables.items():
        placeholder = "{" + key + "}"
        text = text.replace(placeholder, str(value))
    return text


@app.post("/notifications/send")
def send_notification(req: NotificationSendRequest, db: Session = Depends(get_db)):
    template = db.query(Template).filter(Template.id == req.template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    results = []
    for user_id in req.user_ids:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            continue

        final_text = render_template(template.body, {**req.variables, "name": user.name})

        provider_id = None
        payload: Dict[str, Any] = {"text": final_text}
        status_str = "SENT"

        if req.channel == Channel.WHATSAPP_TEXT:
            provider_id = mock_send_whatsapp_text(user.phone_number, final_text)
        elif req.channel == Channel.WHATSAPP_VOICE:
            audio_url = mock_tts_generate(final_text, user.preferred_language)
            provider_id = mock_send_whatsapp_voice(user.phone_number, audio_url)
            payload["audio_url"] = audio_url
        elif req.channel == Channel.EMAIL:
            subject = "Notification from Unified AI Command Centre"
            provider_id = mock_send_email(user.email, subject, final_text)
            payload["subject"] = subject

        notification = Notification(
            user_id=user.id,
            channel=req.channel,
            template_id=template.id,
            payload=payload,
            status=status_str,
            provider_message_id=provider_id,
        )
        db.add(notification)

        conv = Conversation(
            user_id=user.id,
            direction=Direction.OUTBOUND,
            channel=req.channel,
            message_text=final_text if req.channel != Channel.WHATSAPP_VOICE else None,
            audio_url=payload.get("audio_url"),
            language=template.language,
            timestamp=datetime.utcnow()
        )
        db.add(conv)

        db.commit()
        db.refresh(notification)
        results.append({"user_id": user.id, "notification_id": notification.id})

    return {"sent": results}


# =========================
# CONVERSATIONS – LIST
# =========================

@app.get("/conversations", response_model=List[ConversationOut])
def list_conversations(user_id: Optional[int] = None, db: Session = Depends(get_db)):
    q = db.query(Conversation)
    if user_id:
        q = q.filter(Conversation.user_id == user_id)
    return q.order_by(Conversation.timestamp.desc()).all()


# =========================
# WHATSAPP WEBHOOK – INBOUND
# =========================

@app.post("/webhook/whatsapp")
def whatsapp_webhook(payload: WhatsAppWebhookPayload, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.phone_number == payload.phone_number).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found for this phone number")

    if payload.text:
        text = payload.text
    elif payload.audio_url:
        text = mock_asr_transcribe(payload.audio_url)
    else:
        raise HTTPException(status_code=400, detail="No text or audio")

    lang = detect_language(text)
    intent = predict_intent(text)
    sentiment = detect_sentiment(text)

    conv = Conversation(
        user_id=user.id,
        direction=Direction.INBOUND,
        channel=Channel.WHATSAPP_TEXT if payload.text else Channel.WHATSAPP_VOICE,
        message_text=text,
        audio_url=payload.audio_url,
        language=lang,
        intent_name=intent,
        sentiment=sentiment,
        timestamp=datetime.utcnow(),
    )
    db.add(conv)

    # SIMPLE POLICY: if COMPLETION -> send thank you
    reply_text = None
    if intent == "COMPLETION":
        if lang == "hi":
            reply_text = "धन्यवाद! आपका भुगतान दर्ज कर लिया गया है।"
        elif lang == "kn":
            reply_text = "ಧನ್ಯವಾದಗಳು! ನಿಮ್ಮ ಪಾವತಿ ದಾಖಲಿಸಲಾಗಿದೆ."
        elif lang == "ne":
            reply_text = "धन्यवाद! तपाइँको भुक्तानी रेकर्ड भयो।"
        else:
            reply_text = "Thank you! Your payment has been recorded."
    elif intent == "CONFUSED":
        reply_text = "No problem. A team member will contact you shortly to explain."
    elif intent == "OPT_OUT":
        user.status = "INACTIVE"
        reply_text = "You have been unsubscribed from further notifications."

    if reply_text:
        provider_id = mock_send_whatsapp_text(user.phone_number, reply_text)
        conv_out = Conversation(
            user_id=user.id,
            direction=Direction.OUTBOUND,
            channel=Channel.WHATSAPP_TEXT,
            message_text=reply_text,
            language=lang,
            timestamp=datetime.utcnow()
        )
        db.add(conv_out)

        notif = Notification(
            user_id=user.id,
            channel=Channel.WHATSAPP_TEXT,
            template_id=None,
            payload={"text": reply_text},
            status="SENT",
            provider_message_id=provider_id,
        )
        db.add(notif)

    db.commit()
    return {"status": "ok", "intent": intent, "language": lang, "sentiment": sentiment.name}


# =========================
# ROOT
# =========================

@app.get("/")
def root():
    return {"message": "Unified AI Command Centre Backend is running."}


# =========================
# RUN (for direct python main.py)
# =========================
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
