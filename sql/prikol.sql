CREATE DATABASE IF NOT EXISTS `issue_tracker`
  CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE `issue_tracker`;

SET NAMES utf8mb4;
SET time_zone = '+00:00';
SET sql_notes = 0;

SET @old_fk = @@FOREIGN_KEY_CHECKS;
SET FOREIGN_KEY_CHECKS = 0;

SET FOREIGN_KEY_CHECKS = @old_fk;



DROP TABLE IF EXISTS `usergroups`;
DROP TABLE IF EXISTS `assignments`;
DROP TABLE IF EXISTS `comments`;
DROP TABLE IF EXISTS `attachments`;
DROP TABLE IF EXISTS `timeentries`;
DROP TABLE IF EXISTS `taskhistory`;
DROP TABLE IF EXISTS `logs`;
DROP TABLE IF EXISTS `tasks`;
DROP TABLE IF EXISTS `projects`;
DROP TABLE IF EXISTS `groups`;
DROP TABLE IF EXISTS `users`;

SET FOREIGN_KEY_CHECKS = @old_fk;

CREATE TABLE `users` (
  `user_id`       BIGINT NOT NULL AUTO_INCREMENT,
  `login`         VARCHAR(255) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `email`         VARCHAR(256) NOT NULL,
  `first_name`    VARCHAR(255) NOT NULL,
  `last_name`     VARCHAR(255) NOT NULL,
  `is_active`     TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `ux_users_login` (`login`),
  UNIQUE KEY `ux_users_email` (`email`)
) ENGINE=InnoDB;

CREATE TABLE `groups` (
  `group_id`    BIGINT NOT NULL AUTO_INCREMENT,
  `name`        VARCHAR(255) NOT NULL,
  `description` TEXT,
  PRIMARY KEY (`group_id`),
  UNIQUE KEY `ux_groups_name` (`name`)
) ENGINE=InnoDB;

CREATE TABLE `usergroups` (
  `user_id`     BIGINT NOT NULL,
  `group_id`    BIGINT NOT NULL,
  `assigned_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`user_id`, `group_id`),
  CONSTRAINT `fk_usergroups_user`
    FOREIGN KEY (`user_id`)  REFERENCES `users`(`user_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_usergroups_group`
    FOREIGN KEY (`group_id`) REFERENCES `groups`(`group_id`) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE `projects` (
  `project_id`  BIGINT NOT NULL AUTO_INCREMENT,
  `name`        VARCHAR(255) NOT NULL,
  `description` TEXT,
  `start_date`  DATE NULL,
  `due_date`    DATE NULL,
  `status`      ENUM('planned','active','paused','archived') NOT NULL,
  PRIMARY KEY (`project_id`),
  KEY `ix_projects_status` (`status`),
  CONSTRAINT `ck_projects_dates`
    CHECK (`start_date` IS NULL OR `due_date` IS NULL OR `start_date` <= `due_date`)
) ENGINE=InnoDB;

CREATE TABLE `tasks` (
  `task_id`           BIGINT NOT NULL AUTO_INCREMENT,
  `project_id`        BIGINT NOT NULL,
  `title`             VARCHAR(255) NOT NULL,
  `description`       TEXT,
  `status`            ENUM('todo','in_progress','review','blocked','done') NOT NULL,
  `priority`          ENUM('low','normal','high','urgent') NOT NULL,
  `estimated_minutes` INT NULL,
  `due_date`          DATE NULL,
  `reporter_id`       BIGINT NOT NULL,
  `assignee_id`       BIGINT NULL,
  `created_at`        DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`        DATETIME(3) NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`task_id`),
  KEY `ix_tasks_project`  (`project_id`),
  KEY `ix_tasks_status`   (`status`),
  KEY `ix_tasks_priority` (`priority`),
  KEY `ix_tasks_reporter` (`reporter_id`),
  KEY `ix_tasks_assignee` (`assignee_id`),
  CONSTRAINT `fk_tasks_project`
    FOREIGN KEY (`project_id`)  REFERENCES `projects`(`project_id`),
  CONSTRAINT `fk_tasks_reporter`
    FOREIGN KEY (`reporter_id`) REFERENCES `users`(`user_id`),
  CONSTRAINT `fk_tasks_assignee`
    FOREIGN KEY (`assignee_id`) REFERENCES `users`(`user_id`) ON DELETE SET NULL,
  CONSTRAINT `ck_tasks_estimated`
    CHECK (`estimated_minutes` IS NULL OR `estimated_minutes` > 0)
) ENGINE=InnoDB;

CREATE TABLE `assignments` (
  `assignment_id` BIGINT NOT NULL AUTO_INCREMENT,
  `task_id`       BIGINT NOT NULL,
  `user_id`       BIGINT NOT NULL,
  `role_in_task`  VARCHAR(255) NOT NULL,
  `assigned_at`   DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `unassigned_at` DATETIME(3) NULL,
  PRIMARY KEY (`assignment_id`),
  UNIQUE KEY `ux_assignments_task_user` (`task_id`,`user_id`),
  KEY `ix_assignments_task` (`task_id`),
  KEY `ix_assignments_user` (`user_id`),
  CONSTRAINT `fk_assignments_task`
    FOREIGN KEY (`task_id`) REFERENCES `tasks`(`task_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_assignments_user`
    FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE,
  CONSTRAINT `ck_assignments_time`
    CHECK (`unassigned_at` IS NULL OR `unassigned_at` >= `assigned_at`)
) ENGINE=InnoDB;

CREATE TABLE `comments` (
  `comment_id` BIGINT NOT NULL AUTO_INCREMENT,
  `task_id`    BIGINT NOT NULL,
  `author_id`  BIGINT NOT NULL,
  `body`       LONGTEXT NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `edited_at`  DATETIME(3) NULL,
  PRIMARY KEY (`comment_id`),
  KEY `ix_comments_task`   (`task_id`),
  KEY `ix_comments_author` (`author_id`),
  CONSTRAINT `fk_comments_task`
    FOREIGN KEY (`task_id`)   REFERENCES `tasks`(`task_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_comments_author`
    FOREIGN KEY (`author_id`) REFERENCES `users`(`user_id`)
) ENGINE=InnoDB;

CREATE TABLE `attachments` (
  `attachment_id` BIGINT NOT NULL AUTO_INCREMENT,
  `task_id`       BIGINT NOT NULL,
  `uploader_id`   BIGINT NOT NULL,
  `file_name`     VARCHAR(512) NOT NULL,
  `mime_type`     VARCHAR(255) NOT NULL,
  `file_size`     INT NOT NULL,
  `storage_url`   VARCHAR(1000) NOT NULL,
  `uploaded_at`   DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`attachment_id`),
  KEY `ix_attachments_task` (`task_id`),
  KEY `ix_attachments_upl`  (`uploader_id`),
  CONSTRAINT `fk_attachments_task`
    FOREIGN KEY (`task_id`)     REFERENCES `tasks`(`task_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_attachments_uploader`
    FOREIGN KEY (`uploader_id`) REFERENCES `users`(`user_id`),
  CONSTRAINT `ck_attachments_size`
    CHECK (`file_size` > 0)
) ENGINE=InnoDB;

CREATE TABLE `timeentries` (
  `time_entry_id` BIGINT NOT NULL AUTO_INCREMENT,
  `task_id`       BIGINT NOT NULL,
  `user_id`       BIGINT NOT NULL,
  `spent_minutes` INT NOT NULL,
  `work_date`     DATE NOT NULL,
  `note`          TEXT,
  `created_at`    DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`time_entry_id`),
  KEY `ix_timeentries_task` (`task_id`),
  KEY `ix_timeentries_user` (`user_id`),
  KEY `ix_timeentries_date` (`work_date`),
  CONSTRAINT `fk_timeentries_task`
    FOREIGN KEY (`task_id`) REFERENCES `tasks`(`task_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_timeentries_user`
    FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`),
  CONSTRAINT `ck_timeentries_spent`
    CHECK (`spent_minutes` > 0)
) ENGINE=InnoDB;

CREATE TABLE `taskhistory` (
  `history_id` BIGINT NOT NULL AUTO_INCREMENT,
  `task_id`    BIGINT NOT NULL,
  `actor_id`   BIGINT NULL,
  `field_name` VARCHAR(255) NOT NULL,
  `old_value`  LONGTEXT NULL,
  `new_value`  LONGTEXT NULL,
  `changed_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`history_id`),
  KEY `ix_taskhistory_task`  (`task_id`),
  KEY `ix_taskhistory_actor` (`actor_id`),
  CONSTRAINT `fk_taskhistory_task`
    FOREIGN KEY (`task_id`)  REFERENCES `tasks`(`task_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_taskhistory_actor`
    FOREIGN KEY (`actor_id`) REFERENCES `users`(`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE `logs` (
  `log_id`      BIGINT NOT NULL AUTO_INCREMENT,
  `occurred_at` DATETIME(3) NOT NULL,
  `actor_id`    BIGINT NULL,
  `entity_type` VARCHAR(100) NOT NULL,
  `entity_id`   BIGINT NOT NULL,
  `action`      VARCHAR(100) NOT NULL,
  `details_json` JSON NULL,
  PRIMARY KEY (`log_id`),
  KEY `ix_logs_actor` (`actor_id`),
  KEY `ix_logs_entity` (`entity_type`, `entity_id`),
  CONSTRAINT `fk_logs_actor`
    FOREIGN KEY (`actor_id`) REFERENCES `users`(`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB;

SET sql_notes = 1;
