-- Initial conceptual schema
-- Database-specific types may be adapted during implementation.

CREATE TABLE organizations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    parent_id BIGINT NULL,
    organization_type VARCHAR(50) NOT NULL,
    code VARCHAR(50) UNIQUE,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE roles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    organization_id BIGINT NULL,
    PRIMARY KEY (user_id, role_id, organization_id)
);

CREATE TABLE strategic_goals (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    organization_id BIGINT NOT NULL,
    code VARCHAR(50),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    version_number INT NOT NULL DEFAULT 1,
    lifecycle_status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    effective_from DATE NULL,
    effective_to DATE NULL
);

CREATE TABLE kpis (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    strategic_goal_id BIGINT NOT NULL,
    code VARCHAR(50) UNIQUE,
    name VARCHAR(500) NOT NULL,
    definition TEXT,
    formula TEXT,
    unit VARCHAR(50),
    direction VARCHAR(20) DEFAULT 'HIGHER_IS_BETTER',
    lifecycle_status VARCHAR(30) NOT NULL DEFAULT 'DRAFT'
);

CREATE TABLE kpi_targets (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    kpi_id BIGINT NOT NULL,
    period VARCHAR(30) NOT NULL,
    target_value DECIMAL(18,4) NULL,
    UNIQUE(kpi_id, period)
);

CREATE TABLE kpi_measurements (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    kpi_id BIGINT NOT NULL,
    period VARCHAR(30) NOT NULL,
    actual_value DECIMAL(18,4) NULL,
    achievement_percent DECIMAL(10,4) NULL,
    status VARCHAR(30),
    measured_at TIMESTAMP NULL,
    workflow_status VARCHAR(30) NOT NULL DEFAULT 'DRAFT'
);

CREATE TABLE evidences (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    subject_type VARCHAR(100) NOT NULL,
    subject_id BIGINT NOT NULL,
    title VARCHAR(500) NOT NULL,
    storage_key VARCHAR(1000) NOT NULL,
    visibility VARCHAR(20) NOT NULL DEFAULT 'INTERNAL',
    uploaded_by BIGINT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE evaluations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    subject_type VARCHAR(100) NOT NULL,
    subject_id BIGINT NOT NULL,
    period VARCHAR(30),
    standard_reference TEXT,
    standard_value VARCHAR(255),
    actual_value VARCHAR(255),
    gap_value VARCHAR(255),
    analysis TEXT,
    root_cause TEXT,
    public_summary TEXT,
    evaluator_id BIGINT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    evaluated_at TIMESTAMP NULL
);

CREATE TABLE findings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    evaluation_id BIGINT NOT NULL,
    severity VARCHAR(30),
    category VARCHAR(100),
    description TEXT NOT NULL,
    is_public_candidate BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE recommendations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    evaluation_id BIGINT NOT NULL,
    priority VARCHAR(30),
    recommendation_text TEXT NOT NULL,
    owner_organization_id BIGINT NULL,
    target_completion DATE NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'OPEN'
);

CREATE TABLE followups (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    recommendation_id BIGINT NOT NULL,
    action_plan TEXT NOT NULL,
    pic_user_id BIGINT NULL,
    start_date DATE NULL,
    due_date DATE NULL,
    progress_percent DECIMAL(5,2) NOT NULL DEFAULT 0,
    status VARCHAR(30) NOT NULL DEFAULT 'OPEN'
);

CREATE TABLE followup_verifications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    followup_id BIGINT NOT NULL,
    verifier_id BIGINT NOT NULL,
    effective BOOLEAN NULL,
    verification_note TEXT,
    verified_at TIMESTAMP NULL
);

CREATE TABLE approvals (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    subject_type VARCHAR(100) NOT NULL,
    subject_id BIGINT NOT NULL,
    approval_level VARCHAR(100) NOT NULL,
    decision VARCHAR(30) NOT NULL,
    approver_id BIGINT NOT NULL,
    note TEXT,
    decided_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE publications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    subject_type VARCHAR(100) NOT NULL,
    subject_id BIGINT NOT NULL,
    visibility VARCHAR(20) NOT NULL DEFAULT 'INTERNAL',
    public_title VARCHAR(500),
    public_summary TEXT,
    publication_start TIMESTAMP NULL,
    publication_end TIMESTAMP NULL,
    approved_by BIGINT NULL,
    published_by BIGINT NULL,
    published_at TIMESTAMP NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT'
);

CREATE TABLE accreditation_frameworks (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    version VARCHAR(100),
    accreditor VARCHAR(255),
    effective_from DATE NULL,
    effective_to DATE NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE'
);

CREATE TABLE accreditation_criteria (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    framework_id BIGINT NOT NULL,
    code VARCHAR(100),
    title VARCHAR(500) NOT NULL,
    description TEXT
);

CREATE TABLE accreditation_mappings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    criterion_id BIGINT NOT NULL,
    source_type VARCHAR(100) NOT NULL,
    source_key VARCHAR(255) NOT NULL,
    mapping_rule TEXT
);

CREATE TABLE audit_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    actor_id BIGINT NULL,
    action VARCHAR(100) NOT NULL,
    subject_type VARCHAR(100) NOT NULL,
    subject_id BIGINT NULL,
    before_json JSON NULL,
    after_json JSON NULL,
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
