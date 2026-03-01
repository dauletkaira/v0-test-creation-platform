-- Quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_ru TEXT NOT NULL,
  title_kk TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('text', 'video')),
  content_ru TEXT,
  content_kk TEXT,
  video_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Questions table
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question_ru TEXT NOT NULL,
  question_kk TEXT NOT NULL,
  option_a_ru TEXT NOT NULL,
  option_a_kk TEXT NOT NULL,
  option_b_ru TEXT NOT NULL,
  option_b_kk TEXT NOT NULL,
  option_c_ru TEXT NOT NULL,
  option_c_kk TEXT NOT NULL,
  option_d_ru TEXT NOT NULL,
  option_d_kk TEXT NOT NULL,
  correct_option TEXT NOT NULL CHECK (correct_option IN ('a', 'b', 'c', 'd')),
  sort_order INT DEFAULT 0
);

-- Participants table
CREATE TABLE IF NOT EXISTS participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  school TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Results table
CREATE TABLE IF NOT EXISTS results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  score INT NOT NULL,
  total INT NOT NULL,
  answers JSONB,
  completed_at TIMESTAMPTZ DEFAULT now()
);
