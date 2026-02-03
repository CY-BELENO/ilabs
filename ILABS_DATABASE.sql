-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 03, 2026 at 05:40 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ilabs_system`
--

-- --------------------------------------------------------

--
-- Table structure for table `academic_periods`
--

CREATE TABLE `academic_periods` (
  `id` int(11) NOT NULL,
  `semester` varchar(50) NOT NULL,
  `academic_year` varchar(20) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `is_current` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `academic_periods`
--

INSERT INTO `academic_periods` (`id`, `semester`, `academic_year`, `start_date`, `end_date`, `is_current`, `created_at`) VALUES
(1, '2nd Semester', '2023-2024', '2024-01-15', '2024-05-31', 1, '2026-02-01 17:21:13');

-- --------------------------------------------------------

--
-- Table structure for table `auto_release_logs`
--

CREATE TABLE `auto_release_logs` (
  `id` int(11) NOT NULL,
  `lab_id` int(11) NOT NULL,
  `occupancy_status_id` int(11) NOT NULL,
  `release_type` enum('no_show','pir_timeout','manual') DEFAULT 'no_show',
  `triggered_by` enum('system','admin','faculty') DEFAULT 'system',
  `triggered_by_id` int(11) DEFAULT NULL,
  `original_status` varchar(50) DEFAULT NULL,
  `new_status` varchar(50) DEFAULT NULL,
  `release_time` timestamp NOT NULL DEFAULT current_timestamp(),
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `id` int(11) NOT NULL,
  `booking_code` varchar(20) NOT NULL,
  `lab_id` int(11) NOT NULL,
  `faculty_id` int(11) NOT NULL,
  `booking_date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `purpose` enum('extra_class','project','meeting','research','exam','other') DEFAULT 'extra_class',
  `purpose_details` text DEFAULT NULL,
  `course_id` int(11) DEFAULT NULL,
  `section` varchar(10) DEFAULT NULL,
  `status` enum('pending','approved','rejected','cancelled','completed') DEFAULT 'pending',
  `approved_by` int(11) DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `requires_checkin` tinyint(1) DEFAULT 1,
  `grace_period_minutes` int(11) DEFAULT 30,
  `occupancy_status_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

--
-- Dumping data for table `bookings`
--

INSERT INTO `bookings` (`id`, `booking_code`, `lab_id`, `faculty_id`, `booking_date`, `start_time`, `end_time`, `purpose`, `purpose_details`, `course_id`, `section`, `status`, `approved_by`, `approved_at`, `requires_checkin`, `grace_period_minutes`, `occupancy_status_id`, `created_at`, `updated_at`) VALUES
(1, 'BOOK-2024-001', 1, 2, '2026-02-02', '14:00:00', '16:00:00', 'extra_class', 'Make-up class for CS101', NULL, NULL, 'approved', NULL, NULL, 1, 30, NULL, '2026-02-01 17:21:13', '2026-02-01 17:21:13');

-- --------------------------------------------------------

--
-- Table structure for table `courses`
--

CREATE TABLE `courses` (
  `id` int(11) NOT NULL,
  `course_code` varchar(20) NOT NULL,
  `course_name` varchar(150) NOT NULL,
  `units` int(11) DEFAULT 3,
  `department` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `courses`
--

INSERT INTO `courses` (`id`, `course_code`, `course_name`, `units`, `department`, `description`, `created_at`) VALUES
(1, 'CS101', 'Introduction to Programming', 3, 'Computer Science', NULL, '2026-02-01 17:21:13'),
(2, 'CS102', 'Data Structures and Algorithms', 3, 'Computer Science', NULL, '2026-02-01 17:21:13'),
(3, 'IT101', 'Web Development Fundamentals', 3, 'Information Technology', NULL, '2026-02-01 17:21:13'),
(4, 'IT102', 'Database Management Systems', 3, 'Information Technology', NULL, '2026-02-01 17:21:13'),
(5, 'CS201', 'Object-Oriented Programming', 3, 'Computer Science', NULL, '2026-02-01 17:21:13'),
(6, 'IT201', 'Networking Fundamentals', 3, 'Information Technology', NULL, '2026-02-01 17:21:13');

-- --------------------------------------------------------

--
-- Table structure for table `faculty`
--

CREATE TABLE `faculty` (
  `id` int(11) NOT NULL,
  `faculty_id` varchar(20) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `full_name` varchar(100) GENERATED ALWAYS AS (concat(`first_name`,' ',`last_name`)) STORED,
  `email` varchar(100) NOT NULL,
  `department` varchar(100) DEFAULT 'DCpET',
  `nfc_tag_id` varchar(50) NOT NULL,
  `backup_nfc_tag_id` varchar(50) DEFAULT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `role` enum('faculty','admin','lab_manager') DEFAULT 'faculty',
  `is_active` tinyint(1) DEFAULT 1,
  `total_no_shows` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `faculty`
--

INSERT INTO `faculty` (`id`, `faculty_id`, `first_name`, `last_name`, `email`, `department`, `nfc_tag_id`, `backup_nfc_tag_id`, `password_hash`, `role`, `is_active`, `total_no_shows`, `created_at`, `updated_at`) VALUES
(1, '101', 'JOMAR', 'RUIZ', 'jomar.ruiz@pup.edu.ph', 'DCpET', 'B3:8E:C9:01', NULL, NULL, 'admin', 1, 0, '2026-02-01 17:21:13', '2026-02-02 15:13:54'),
(2, '102', 'MIKEL', 'LEGASPI', 'mikel.legaspi@pup.edu.ph', 'DCpET', 'C3:E9:17:2D', NULL, NULL, 'faculty', 1, 0, '2026-02-01 17:21:13', '2026-02-02 15:13:54'),
(3, '103', 'JONATHAN', 'MANARANG', 'jonathan.manarang@pup.edu.ph', 'DCpET', 'D3:DA:EF:2C', NULL, NULL, 'faculty', 1, 0, '2026-02-01 17:21:13', '2026-02-02 15:13:54'),
(4, '104', 'JOSE MARIE', 'DIPAY', 'josemarie.dipay@pup.edu.ph', 'DCpET', 'F3:6C:1A:2D', NULL, NULL, 'faculty', 1, 0, '2026-02-02 15:13:54', '2026-02-02 15:13:54');

-- --------------------------------------------------------

--
-- Table structure for table `key_management`
--

CREATE TABLE `key_management` (
  `id` int(11) NOT NULL,
  `lab_id` int(11) NOT NULL,
  `key_number` varchar(20) NOT NULL,
  `faculty_id` int(11) DEFAULT NULL,
  `issued_by` int(11) DEFAULT NULL,
  `issued_at` datetime DEFAULT NULL,
  `returned_at` datetime DEFAULT NULL,
  `status` enum('available','issued','lost') DEFAULT 'available',
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `labs`
--

CREATE TABLE `labs` (
  `id` int(11) NOT NULL,
  `lab_code` varchar(20) NOT NULL,
  `lab_name` varchar(100) NOT NULL,
  `room_number` varchar(20) DEFAULT NULL,
  `building` varchar(50) DEFAULT NULL,
  `capacity` int(11) DEFAULT 30,
  `equipment` text DEFAULT NULL,
  `nfc_reader_id` varchar(50) DEFAULT NULL,
  `pir_sensor_id` varchar(50) DEFAULT NULL,
  `auto_release_minutes` int(11) DEFAULT 30,
  `pir_timeout_minutes` int(11) DEFAULT 20,
  `requires_nfc_checkin` tinyint(1) DEFAULT 1,
  `auto_update_enabled` tinyint(1) DEFAULT 1,
  `status` enum('available','occupied','maintenance','reserved') DEFAULT 'available',
  `current_occupancy_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `labs`
--

INSERT INTO `labs` (`id`, `lab_code`, `lab_name`, `room_number`, `building`, `capacity`, `equipment`, `nfc_reader_id`, `pir_sensor_id`, `auto_release_minutes`, `pir_timeout_minutes`, `requires_nfc_checkin`, `auto_update_enabled`, `status`, `current_occupancy_id`, `created_at`, `updated_at`) VALUES
(1, 'LAB104', 'Computer Laboratory 104', '104', 'ITECH Building', 30, '30 PCs, Projector, Whiteboard, AC', NULL, NULL, 30, 20, 1, 1, 'available', NULL, '2026-02-01 17:21:13', '2026-02-01 17:21:13'),
(2, 'LAB203', 'Computer Laboratory 203', '203', 'ITECH Building', 25, '25 PCs, Cisco Routers, Switches, AC', NULL, NULL, 30, 20, 1, 1, 'available', NULL, '2026-02-01 17:21:13', '2026-02-02 14:52:38'),
(3, 'LAB204', 'Computer Laboratory 204', '204', 'ITECH Building', 30, '30 PCs, Whiteboard, Projector, AC', NULL, NULL, 30, 20, 1, 1, 'available', NULL, '2026-02-01 17:21:13', '2026-02-02 14:52:50');

-- --------------------------------------------------------

--
-- Table structure for table `nfc_access_logs`
--

CREATE TABLE `nfc_access_logs` (
  `id` int(11) NOT NULL,
  `lab_id` int(11) NOT NULL,
  `faculty_id` int(11) NOT NULL,
  `nfc_tag_id` varchar(50) NOT NULL,
  `action` enum('tap_in','tap_out','invalid','unauthorized') DEFAULT 'tap_in',
  `access_point` enum('door','lab_desk','admin_desk') DEFAULT 'door',
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `matched_schedule_id` int(11) DEFAULT NULL,
  `matched_booking_id` int(11) DEFAULT NULL,
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `recipient_id` int(11) NOT NULL,
  `recipient_type` enum('faculty','admin','all') DEFAULT 'faculty',
  `title` varchar(200) NOT NULL,
  `message` text NOT NULL,
  `type` enum('booking_approved','booking_rejected','no_show_warning','pir_timeout','lab_available','key_issued','system_alert') DEFAULT 'system_alert',
  `related_id` int(11) DEFAULT NULL,
  `related_type` varchar(50) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `read_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `occupancy_status`
--

CREATE TABLE `occupancy_status` (
  `id` int(11) NOT NULL,
  `lab_id` int(11) NOT NULL,
  `schedule_type` enum('regular','booking') NOT NULL,
  `schedule_id` int(11) DEFAULT NULL,
  `faculty_id` int(11) NOT NULL,
  `expected_start` datetime NOT NULL,
  `expected_end` datetime NOT NULL,
  `actual_start` datetime DEFAULT NULL,
  `actual_end` datetime DEFAULT NULL,
  `status` enum('scheduled','no_show','active','completed','early_release','pir_timeout') DEFAULT 'scheduled',
  `pir_last_motion` datetime DEFAULT NULL,
  `no_show_triggered` tinyint(1) DEFAULT 0,
  `pir_timeout_triggered` tinyint(1) DEFAULT 0,
  `no_show_at` datetime DEFAULT NULL,
  `released_at` datetime DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pir_logs`
--

CREATE TABLE `pir_logs` (
  `id` int(11) NOT NULL,
  `lab_id` int(11) NOT NULL,
  `motion_detected` tinyint(1) NOT NULL,
  `sensor_value` int(11) DEFAULT NULL,
  `occupancy_status_id` int(11) DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `regular_schedules`
--

CREATE TABLE `regular_schedules` (
  `id` int(11) NOT NULL,
  `academic_period_id` int(11) NOT NULL,
  `lab_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `faculty_id` int(11) NOT NULL,
  `day_of_week` enum('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday') NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `section` varchar(10) NOT NULL,
  `requires_attendance` tinyint(1) DEFAULT 1,
  `grace_period_minutes` int(11) DEFAULT 30,
  `auto_cancel_if_no_show` tinyint(1) DEFAULT 1,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `regular_schedules`
--

INSERT INTO `regular_schedules` (`id`, `academic_period_id`, `lab_id`, `course_id`, `faculty_id`, `day_of_week`, `start_time`, `end_time`, `section`, `requires_attendance`, `grace_period_minutes`, `auto_cancel_if_no_show`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 1, 2, 'Monday', '08:00:00', '10:00:00', 'A', 1, 30, 1, 1, '2026-02-01 17:21:13', '2026-02-01 17:21:13'),
(2, 1, 1, 2, 2, 'Monday', '10:00:00', '12:00:00', 'B', 1, 30, 1, 1, '2026-02-01 17:21:13', '2026-02-01 17:21:13'),
(3, 1, 2, 3, 3, 'Monday', '09:00:00', '11:00:00', 'D', 1, 30, 1, 1, '2026-02-01 17:21:13', '2026-02-01 17:21:13'),
(4, 1, 3, 4, 2, 'Monday', '11:00:00', '13:00:00', 'F', 1, 30, 1, 1, '2026-02-01 17:21:13', '2026-02-01 17:21:13'),
(5, 1, 3, 5, 3, 'Wednesday', '13:00:00', '15:00:00', 'C', 1, 30, 1, 1, '2026-02-01 17:21:13', '2026-02-01 17:21:13');

-- --------------------------------------------------------

--
-- Table structure for table `system_logs`
--

CREATE TABLE `system_logs` (
  `id` int(11) NOT NULL,
  `log_level` enum('info','warning','error','debug') DEFAULT 'info',
  `component` varchar(50) DEFAULT NULL,
  `message` text NOT NULL,
  `details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`details`)),
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Stand-in structure for view `vw_current_lab_status`
-- (See below for the actual view)
--
CREATE TABLE `vw_current_lab_status` (
`id` int(11)
,`lab_code` varchar(20)
,`lab_name` varchar(100)
,`system_status` enum('available','occupied','maintenance','reserved')
,`real_time_status` varchar(9)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `vw_faculty_dashboard`
-- (See below for the actual view)
--
CREATE TABLE `vw_faculty_dashboard` (
`faculty_id` int(11)
,`faculty_number` varchar(20)
,`full_name` varchar(100)
,`department` varchar(100)
,`total_classes` bigint(21)
,`total_bookings` bigint(21)
);

-- --------------------------------------------------------

--
-- Structure for view `vw_current_lab_status`
--
DROP TABLE IF EXISTS `vw_current_lab_status`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_current_lab_status`  AS SELECT `l`.`id` AS `id`, `l`.`lab_code` AS `lab_code`, `l`.`lab_name` AS `lab_name`, `l`.`status` AS `system_status`, CASE WHEN exists(select 1 from `occupancy_status` `os` where `os`.`lab_id` = `l`.`id` AND `os`.`status` = 'active' limit 1) THEN 'occupied' WHEN exists(select 1 from `bookings` `b` where `b`.`lab_id` = `l`.`id` AND `b`.`booking_date` = curdate() AND `b`.`status` = 'approved' AND curtime() between `b`.`start_time` and `b`.`end_time` limit 1) THEN 'reserved' ELSE 'available' END AS `real_time_status` FROM `labs` AS `l` ;

-- --------------------------------------------------------

--
-- Structure for view `vw_faculty_dashboard`
--
DROP TABLE IF EXISTS `vw_faculty_dashboard`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_faculty_dashboard`  AS SELECT `f`.`id` AS `faculty_id`, `f`.`faculty_id` AS `faculty_number`, `f`.`full_name` AS `full_name`, `f`.`department` AS `department`, count(distinct `rs`.`id`) AS `total_classes`, count(distinct `b`.`id`) AS `total_bookings` FROM ((`faculty` `f` left join `regular_schedules` `rs` on(`f`.`id` = `rs`.`faculty_id` and `rs`.`is_active` = 1)) left join `bookings` `b` on(`f`.`id` = `b`.`faculty_id` and `b`.`status` = 'approved')) GROUP BY `f`.`id` ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `academic_periods`
--
ALTER TABLE `academic_periods`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_semester` (`semester`,`academic_year`);

--
-- Indexes for table `auto_release_logs`
--
ALTER TABLE `auto_release_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `occupancy_status_id` (`occupancy_status_id`),
  ADD KEY `idx_release_time` (`release_time`),
  ADD KEY `idx_lab_release` (`lab_id`,`release_time`);

--
-- Indexes for table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `booking_code` (`booking_code`),
  ADD KEY `faculty_id` (`faculty_id`),
  ADD KEY `course_id` (`course_id`),
  ADD KEY `approved_by` (`approved_by`),
  ADD KEY `idx_booking_date` (`booking_date`,`start_time`),
  ADD KEY `idx_status_lab` (`lab_id`,`status`,`booking_date`);

--
-- Indexes for table `courses`
--
ALTER TABLE `courses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `course_code` (`course_code`);

--
-- Indexes for table `faculty`
--
ALTER TABLE `faculty`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `faculty_id` (`faculty_id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `nfc_tag_id` (`nfc_tag_id`),
  ADD KEY `idx_nfc_tag` (`nfc_tag_id`),
  ADD KEY `idx_faculty_id` (`faculty_id`);

--
-- Indexes for table `key_management`
--
ALTER TABLE `key_management`
  ADD PRIMARY KEY (`id`),
  ADD KEY `lab_id` (`lab_id`),
  ADD KEY `issued_by` (`issued_by`),
  ADD KEY `idx_key_status` (`key_number`,`status`),
  ADD KEY `idx_faculty_key` (`faculty_id`,`status`);

--
-- Indexes for table `labs`
--
ALTER TABLE `labs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `lab_code` (`lab_code`),
  ADD UNIQUE KEY `nfc_reader_id` (`nfc_reader_id`),
  ADD UNIQUE KEY `pir_sensor_id` (`pir_sensor_id`);

--
-- Indexes for table `nfc_access_logs`
--
ALTER TABLE `nfc_access_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `faculty_id` (`faculty_id`),
  ADD KEY `idx_lab_faculty_time` (`lab_id`,`faculty_id`,`timestamp`),
  ADD KEY `idx_nfc_actions` (`nfc_tag_id`,`action`,`timestamp`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_recipient_unread` (`recipient_id`,`is_read`,`created_at`);

--
-- Indexes for table `occupancy_status`
--
ALTER TABLE `occupancy_status`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_lab_status_time` (`lab_id`,`status`,`expected_start`),
  ADD KEY `idx_active_occupancy` (`lab_id`,`status`),
  ADD KEY `idx_faculty_schedule` (`faculty_id`,`expected_start`);

--
-- Indexes for table `pir_logs`
--
ALTER TABLE `pir_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_lab_motion_time` (`lab_id`,`timestamp`),
  ADD KEY `idx_occupancy_motion` (`occupancy_status_id`,`timestamp`);

--
-- Indexes for table `regular_schedules`
--
ALTER TABLE `regular_schedules`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_schedule` (`lab_id`,`day_of_week`,`start_time`,`academic_period_id`,`section`),
  ADD KEY `academic_period_id` (`academic_period_id`),
  ADD KEY `course_id` (`course_id`),
  ADD KEY `faculty_id` (`faculty_id`),
  ADD KEY `idx_day_time` (`day_of_week`,`start_time`),
  ADD KEY `idx_lab_day` (`lab_id`,`day_of_week`);

--
-- Indexes for table `system_logs`
--
ALTER TABLE `system_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_component_time` (`component`,`timestamp`),
  ADD KEY `idx_level_time` (`log_level`,`timestamp`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `academic_periods`
--
ALTER TABLE `academic_periods`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `auto_release_logs`
--
ALTER TABLE `auto_release_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `bookings`
--
ALTER TABLE `bookings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `courses`
--
ALTER TABLE `courses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `faculty`
--
ALTER TABLE `faculty`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `key_management`
--
ALTER TABLE `key_management`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `labs`
--
ALTER TABLE `labs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `nfc_access_logs`
--
ALTER TABLE `nfc_access_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `occupancy_status`
--
ALTER TABLE `occupancy_status`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pir_logs`
--
ALTER TABLE `pir_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `regular_schedules`
--
ALTER TABLE `regular_schedules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `system_logs`
--
ALTER TABLE `system_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `auto_release_logs`
--
ALTER TABLE `auto_release_logs`
  ADD CONSTRAINT `auto_release_logs_ibfk_1` FOREIGN KEY (`lab_id`) REFERENCES `labs` (`id`),
  ADD CONSTRAINT `auto_release_logs_ibfk_2` FOREIGN KEY (`occupancy_status_id`) REFERENCES `occupancy_status` (`id`);

--
-- Constraints for table `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`lab_id`) REFERENCES `labs` (`id`),
  ADD CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`id`),
  ADD CONSTRAINT `bookings_ibfk_3` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`),
  ADD CONSTRAINT `bookings_ibfk_4` FOREIGN KEY (`approved_by`) REFERENCES `faculty` (`id`);

--
-- Constraints for table `key_management`
--
ALTER TABLE `key_management`
  ADD CONSTRAINT `key_management_ibfk_1` FOREIGN KEY (`lab_id`) REFERENCES `labs` (`id`),
  ADD CONSTRAINT `key_management_ibfk_2` FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`id`),
  ADD CONSTRAINT `key_management_ibfk_3` FOREIGN KEY (`issued_by`) REFERENCES `faculty` (`id`);

--
-- Constraints for table `nfc_access_logs`
--
ALTER TABLE `nfc_access_logs`
  ADD CONSTRAINT `nfc_access_logs_ibfk_1` FOREIGN KEY (`lab_id`) REFERENCES `labs` (`id`),
  ADD CONSTRAINT `nfc_access_logs_ibfk_2` FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`id`);

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`recipient_id`) REFERENCES `faculty` (`id`);

--
-- Constraints for table `occupancy_status`
--
ALTER TABLE `occupancy_status`
  ADD CONSTRAINT `occupancy_status_ibfk_1` FOREIGN KEY (`lab_id`) REFERENCES `labs` (`id`),
  ADD CONSTRAINT `occupancy_status_ibfk_2` FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`id`);

--
-- Constraints for table `pir_logs`
--
ALTER TABLE `pir_logs`
  ADD CONSTRAINT `pir_logs_ibfk_1` FOREIGN KEY (`lab_id`) REFERENCES `labs` (`id`),
  ADD CONSTRAINT `pir_logs_ibfk_2` FOREIGN KEY (`occupancy_status_id`) REFERENCES `occupancy_status` (`id`);

--
-- Constraints for table `regular_schedules`
--
ALTER TABLE `regular_schedules`
  ADD CONSTRAINT `regular_schedules_ibfk_1` FOREIGN KEY (`academic_period_id`) REFERENCES `academic_periods` (`id`),
  ADD CONSTRAINT `regular_schedules_ibfk_2` FOREIGN KEY (`lab_id`) REFERENCES `labs` (`id`),
  ADD CONSTRAINT `regular_schedules_ibfk_3` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`),
  ADD CONSTRAINT `regular_schedules_ibfk_4` FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
