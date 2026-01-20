-- Create Database
CREATE DATABASE IF NOT EXISTS data_dashboard;
USE data_dashboard;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    full_name VARCHAR(100),
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    INDEX idx_username (username),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Contractor List Table
CREATE TABLE IF NOT EXISTS contractor_list (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sno VARCHAR(50),
    efile VARCHAR(100),
    contractor VARCHAR(200),
    description TEXT,
    value VARCHAR(100),
    start_date DATE,
    end_date DATE,
    duration VARCHAR(50),
    file_name VARCHAR(255),
    file_base64 LONGTEXT,
    file_type VARCHAR(100),
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_contractor (contractor),
    INDEX idx_end_date (end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Bill Tracker Table
CREATE TABLE IF NOT EXISTS bill_tracker (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sno VARCHAR(50),
    efile VARCHAR(100),
    contractor VARCHAR(200),
    approved_date DATE,
    approved_amount VARCHAR(100),
    bill_frequency VARCHAR(50),
    bill_date DATE,
    bill_due_date DATE,
    bill_paid_date DATE,
    paid_amount VARCHAR(100),
    file_name VARCHAR(255),
    file_base64 LONGTEXT,
    file_type VARCHAR(100),
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_contractor (contractor),
    INDEX idx_bill_due_date (bill_due_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- EPBG Table
CREATE TABLE IF NOT EXISTS epbg (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sno VARCHAR(50),
    contractor VARCHAR(200),
    po_no VARCHAR(100),
    bg_no VARCHAR(100),
    bg_date DATE,
    bg_amount VARCHAR(100),
    bg_validity VARCHAR(100),
    gem_bid VARCHAR(100),
    ref_efile VARCHAR(100),
    file_name VARCHAR(255),
    file_base64 LONGTEXT,
    file_type VARCHAR(100),
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_contractor (contractor),
    INDEX idx_bg_no (bg_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert Default Users
-- Password hashes are for: Admin@123, Admin@456, User@123, User@456, User@789, User@012
INSERT INTO users (username, password_hash, role, full_name, email) VALUES
('admin1', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7RfZhQbTH.', 'admin', 'Admin One', 'admin1@dashboard.com'),
('admin2', '$2b$12$xQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7RfZhQbTI.', 'admin', 'Admin Two', 'admin2@dashboard.com'),
('user1', '$2b$12$yQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7RfZhQbTJ.', 'user', 'User One', 'user1@dashboard.com'),
('user2', '$2b$12$zQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7RfZhQbTK.', 'user', 'User Two', 'user2@dashboard.com'),
('user3', '$2b$12$aQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7RfZhQbTL.', 'user', 'User Three', 'user3@dashboard.com'),
('user4', '$2b$12$bQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7RfZhQbTM.', 'user', 'User Four', 'user4@dashboard.com');