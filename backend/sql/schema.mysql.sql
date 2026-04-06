-- Bugpedia — MySQL 8.x
-- Exécuter une fois : mysql -u root -p bugpedia < sql/schema.mysql.sql

CREATE DATABASE IF NOT EXISTS bugpedia CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE bugpedia;

CREATE TABLE users (
  id CHAR(36) NOT NULL PRIMARY KEY,
  github_username VARCHAR(255) NOT NULL,
  reputation INT NOT NULL DEFAULT 0,
  contributions INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_users_github_username (github_username)
) ENGINE=InnoDB;

CREATE TABLE library_versions (
  id CHAR(36) NOT NULL PRIMARY KEY,
  library_name VARCHAR(255) NOT NULL,
  version VARCHAR(100) NOT NULL,
  release_date DATE NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_lib_ver (library_name, version)
) ENGINE=InnoDB;

CREATE TABLE bugs (
  id CHAR(36) NOT NULL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  library VARCHAR(255) NOT NULL,
  version VARCHAR(100) NOT NULL,
  environment JSON NOT NULL,
  status ENUM ('open', 'closed', 'duplicate') NOT NULL DEFAULT 'open',
  author_user_id CHAR(36) NULL,
  github_issue_id BIGINT NULL,
  github_repo_full_name VARCHAR(500) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_bugs_library_version (library, version),
  KEY idx_bugs_status (status),
  KEY idx_bugs_created (created_at DESC),
  CONSTRAINT fk_bugs_author FOREIGN KEY (author_user_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE bug_relations (
  id CHAR(36) NOT NULL PRIMARY KEY,
  from_bug_id CHAR(36) NOT NULL,
  to_bug_id CHAR(36) NOT NULL,
  relation_type VARCHAR(50) NOT NULL DEFAULT 'similar',
  note TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_relation (from_bug_id, to_bug_id, relation_type),
  CONSTRAINT chk_relation_distinct CHECK (from_bug_id <> to_bug_id),
  CONSTRAINT fk_rel_from FOREIGN KEY (from_bug_id) REFERENCES bugs (id) ON DELETE CASCADE,
  CONSTRAINT fk_rel_to FOREIGN KEY (to_bug_id) REFERENCES bugs (id) ON DELETE CASCADE,
  KEY idx_rel_from (from_bug_id),
  KEY idx_rel_to (to_bug_id)
) ENGINE=InnoDB;

CREATE TABLE solutions (
  id CHAR(36) NOT NULL PRIMARY KEY,
  bug_id CHAR(36) NOT NULL,
  content TEXT NOT NULL,
  author_user_id CHAR(36) NULL,
  author_display VARCHAR(255) NULL,
  is_verified TINYINT(1) NOT NULL DEFAULT 0,
  verification_count INT NOT NULL DEFAULT 0,
  github_pr_link VARCHAR(1000) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_verified_count CHECK (is_verified = 0 OR verification_count >= 3),
  KEY idx_solutions_bug (bug_id),
  CONSTRAINT fk_solutions_bug FOREIGN KEY (bug_id) REFERENCES bugs (id) ON DELETE CASCADE,
  CONSTRAINT fk_solutions_author FOREIGN KEY (author_user_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE votes (
  id CHAR(36) NOT NULL PRIMARY KEY,
  solution_id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  is_upvote TINYINT(1) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_vote_user_solution (solution_id, user_id),
  KEY idx_votes_solution (solution_id),
  CONSTRAINT fk_votes_solution FOREIGN KEY (solution_id) REFERENCES solutions (id) ON DELETE CASCADE,
  CONSTRAINT fk_votes_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB;
