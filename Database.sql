-- Database: unified_ai_db

-- DROP DATABASE IF EXISTS unified_ai_db;

CREATE DATABASE unified_ai_db
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'English_India.1252'
    LC_CTYPE = 'English_India.1252'
    LOCALE_PROVIDER = 'libc'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1
    IS_TEMPLATE = False;


	CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255),
    user_type VARCHAR(20) NOT NULL,
    preferred_language VARCHAR(10) DEFAULT 'en',
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    channel VARCHAR(50) NOT NULL,
    language VARCHAR(10) NOT NULL,
    body TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE workflows (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE workflow_steps (
    id SERIAL PRIMARY KEY,
    workflow_id INT REFERENCES workflows(id),
    step_order INT NOT NULL,
    trigger_type VARCHAR(50) DEFAULT 'TIME_BASED',
    template_id INT REFERENCES templates(id),
    expected_intent VARCHAR(100),
    next_step_on_success INT,
    next_step_on_failure INT
);

CREATE TABLE workflow_instances (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    workflow_id INT REFERENCES workflows(id),
    current_step_id INT REFERENCES workflow_steps(id),
    status VARCHAR(50) DEFAULT 'IN_PROGRESS',
    started_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE intents (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT
);

CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    workflow_instance_id INT REFERENCES workflow_instances(id),
    channel VARCHAR(50) NOT NULL,
    template_id INT REFERENCES templates(id),
    payload JSONB,
    status VARCHAR(20) DEFAULT 'SENT',
    provider_message_id VARCHAR(255),
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE conversations (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    direction VARCHAR(20) NOT NULL,
    channel VARCHAR(50) NOT NULL,
    message_text TEXT,
    audio_url TEXT,
    language VARCHAR(10),
    intent_name VARCHAR(100),
    sentiment VARCHAR(20),
    timestamp TIMESTAMP DEFAULT NOW()
);

