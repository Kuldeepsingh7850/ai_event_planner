-- AI Event Planner Database Schema
-- MySQL Script

CREATE DATABASE IF NOT EXISTS `ai_event_planner`;
USE `ai_event_planner`;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `clerk_id` VARCHAR(255) UNIQUE DEFAULT NULL,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) UNIQUE NOT NULL,
  `password` VARCHAR(255) DEFAULT NULL,
  `role` VARCHAR(50) DEFAULT 'user', -- 'admin' or 'user'
  `status` VARCHAR(50) DEFAULT 'active', -- 'active' or 'blocked'
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Events Table
CREATE TABLE IF NOT EXISTS `events` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `event_type` VARCHAR(100) NOT NULL, -- e.g., Wedding, Birthday, Corporate, Farewell
  `date` DATE NOT NULL,
  `time` TIME NOT NULL,
  `location` VARCHAR(255) NOT NULL,
  `budget` DECIMAL(12, 2) NOT NULL,
  `guest_count` INT NOT NULL,
  `status` VARCHAR(50) DEFAULT 'planning', -- 'planning', 'ongoing', 'completed', 'cancelled'
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Guests Table
CREATE TABLE IF NOT EXISTS `guests` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `event_id` INT NOT NULL,
  `guest_name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `status` VARCHAR(50) DEFAULT 'pending', -- 'pending', 'confirmed', 'declined'
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Budget Table
CREATE TABLE IF NOT EXISTS `budget` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `event_id` INT UNIQUE NOT NULL,
  `total_budget` DECIMAL(12, 2) NOT NULL,
  `expenses` DECIMAL(12, 2) DEFAULT 0.00,
  `remaining_budget` DECIMAL(12, 2) NOT NULL,
  FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4b. Expenses Table (Detailed Expense Tracking)
CREATE TABLE IF NOT EXISTS `expenses` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `event_id` INT NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `amount` DECIMAL(12, 2) NOT NULL,
  `category` VARCHAR(100) NOT NULL, -- e.g., Venue, Catering, Decor, AV, Miscellaneous
  `date` DATE NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Tasks Table
CREATE TABLE IF NOT EXISTS `tasks` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `event_id` INT NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `deadline` DATE NOT NULL,
  `status` VARCHAR(50) DEFAULT 'pending', -- 'pending', 'completed'
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Vendors Table
CREATE TABLE IF NOT EXISTS `vendors` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `event_id` INT NOT NULL,
  `vendor_name` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100) NOT NULL, -- e.g., Caterer, Photographer, Decorator, Florist, DJ
  `contact` VARCHAR(255) NOT NULL,
  `cost` DECIMAL(12, 2) DEFAULT 0.00,
  `status` VARCHAR(50) DEFAULT 'contacted', -- 'contacted', 'hired', 'completed'
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Feedback Table
CREATE TABLE IF NOT EXISTS `feedback` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `rating` INT NOT NULL, -- 1 to 5 stars
  `comment` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Notifications Table
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `message` VARCHAR(255) NOT NULL,
  `status` VARCHAR(50) DEFAULT 'unread', -- 'unread', 'read'
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed Data for testing
-- Admin password is bcrypt hashed for 'admin123' -> $2a$10$T8ZqYh8m/bC7rJ4N7fPBOOn18R8h/vFpW5ZkQzE87uWfD/F79Hl.G
-- User password is bcrypt hashed for 'user123' -> $2a$10$wE9l1i/7NqS6xpxdpe.Tgu.4v4iA.YFz5kP3xZ32sFskBqgM0P/sC

INSERT INTO `users` (`name`, `email`, `password`, `role`) VALUES
('System Administrator', 'admin@eventplanner.com', '$2a$10$oD6mhCiS4LjXcvohp09.5utMn8Pw2s9FlJ5/QBmTUEnC9.Jru/Gly', 'admin'),
('John Doe', 'john@gmail.com', '$2a$10$m0GWB4B8r/XXzJ0tusxemOiFmlLRZUUmUf73wIETwvwYWIkZEktV.', 'user');

INSERT INTO `events` (`id`, `user_id`, `title`, `description`, `event_type`, `date`, `time`, `location`, `budget`, `guest_count`, `status`) VALUES
(1, 2, 'Annual College Farewell 2026', 'Farewell party for the graduating computer science batch.', 'Farewell', '2026-06-15', '16:00:00', 'Main Campus Auditorium', 50000.00, 200, 'planning');

INSERT INTO `budget` (`event_id`, `total_budget`, `expenses`, `remaining_budget`) VALUES
(1, 50000.00, 15000.00, 35000.00);

INSERT INTO `expenses` (`event_id`, `title`, `amount`, `category`, `date`) VALUES
(1, 'Auditorium Booking Deposit', 10000.00, 'Venue', '2026-05-20'),
(1, 'Stage Decoration Advance', 5000.00, 'Decor', '2026-05-21');

INSERT INTO `guests` (`event_id`, `guest_name`, `email`, `status`) VALUES
(1, 'Prof. Alan Turing', 'turing@univ.edu', 'confirmed'),
(1, 'Dr. Grace Hopper', 'hopper@univ.edu', 'pending'),
(1, 'Steve Jobs', 'steve@apple.com', 'declined');

INSERT INTO `tasks` (`event_id`, `title`, `deadline`, `status`) VALUES
(1, 'Book caterer for dinner buffet', '2026-06-01', 'pending'),
(1, 'Send digital invitations to seniors', '2026-05-30', 'completed'),
(1, 'Coordinate playlist with photographer/DJ', '2026-06-10', 'pending');

INSERT INTO `vendors` (`event_id`, `vendor_name`, `category`, `contact`, `cost`, `status`) VALUES
(1, 'Delicious Bites Catering', 'Caterer', '+1-555-0199', 25000.00, 'contacted'),
(1, 'Epic Moments Photography', 'Photographer', '+1-555-0188', 12000.00, 'hired');

INSERT INTO `notifications` (`user_id`, `message`, `status`) VALUES
(2, 'Your budget for Annual College Farewell 2026 has been successfully updated.', 'unread'),
(2, 'Reminder: Task "Send digital invitations to seniors" has been marked completed.', 'unread');

INSERT INTO `feedback` (`user_id`, `rating`, `comment`) VALUES
(2, 5, 'Absolutely love the AI generation features! Saved me hours of timeline drafting.');
