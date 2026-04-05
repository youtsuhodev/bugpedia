-- Bugpedia — schéma PostgreSQL (compatible SQLite avec ajustements mineurs)
-- Contraintes métier :
--   - is_verified => verification_count >= 3
--   - au plus une solution vérifiée par bug (index partiel unique)

CREATE TYPE bug_status AS ENUM ('open', 'closed', 'duplicate');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    github_username VARCHAR(255) NOT NULL UNIQUE,
    reputation INTEGER NOT NULL DEFAULT 0,
    contributions INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE library_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    library_name VARCHAR(255) NOT NULL,
    version VARCHAR(100) NOT NULL,
    release_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (library_name, version)
);

CREATE TABLE bugs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    library VARCHAR(255) NOT NULL,
    version VARCHAR(100) NOT NULL,
    environment JSONB NOT NULL DEFAULT '{}',
    status bug_status NOT NULL DEFAULT 'open',
    author_user_id UUID REFERENCES users (id) ON DELETE SET NULL,
    github_issue_id BIGINT,
    github_repo_full_name VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bugs_library_version ON bugs (library, version);
CREATE INDEX idx_bugs_status ON bugs (status);
CREATE INDEX idx_bugs_created ON bugs (created_at DESC);

-- Arête du graphe « bugs similaires » (symétrique géré en application ou doubles arêtes)
CREATE TABLE bug_relations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_bug_id UUID NOT NULL REFERENCES bugs (id) ON DELETE CASCADE,
    to_bug_id UUID NOT NULL REFERENCES bugs (id) ON DELETE CASCADE,
    relation_type VARCHAR(50) NOT NULL DEFAULT 'similar',
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (from_bug_id, to_bug_id, relation_type),
    CHECK (from_bug_id <> to_bug_id)
);

CREATE INDEX idx_bug_relations_from ON bug_relations (from_bug_id);
CREATE INDEX idx_bug_relations_to ON bug_relations (to_bug_id);

CREATE TABLE solutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bug_id UUID NOT NULL REFERENCES bugs (id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    author_user_id UUID REFERENCES users (id) ON DELETE SET NULL,
    author_display VARCHAR(255),
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    verification_count INTEGER NOT NULL DEFAULT 0,
    github_pr_link VARCHAR(1000),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_verified_implies_count CHECK (NOT is_verified OR verification_count >= 3)
);

CREATE INDEX idx_solutions_bug ON solutions (bug_id);
CREATE INDEX idx_solutions_verified ON solutions (bug_id, is_verified);

-- Une seule solution vérifiée par bug
CREATE UNIQUE INDEX uq_one_verified_solution_per_bug ON solutions (bug_id)
    WHERE is_verified = TRUE;

CREATE TABLE votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    solution_id UUID NOT NULL REFERENCES solutions (id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    is_upvote BOOLEAN NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (solution_id, user_id)
);

CREATE INDEX idx_votes_solution ON votes (solution_id);

-- ---------------------------------------------------------------------------
-- Variante SQLite (sans ENUM / gen_random_uuid) — décommentez pour SQLite pur :
-- ---------------------------------------------------------------------------
-- CREATE TABLE users (... id TEXT PRIMARY KEY, ...);
-- bugs.status TEXT CHECK (status IN ('open','closed','duplicate'));
-- Remplacer JSONB par TEXT (JSON sérialisé).
-- Index partiel : CREATE UNIQUE INDEX uq_one_verified ... WHERE is_verified = 1;
