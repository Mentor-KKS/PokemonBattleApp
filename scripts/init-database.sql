-- Initialize the Pokemon Battle App database
-- Run this script to set up the required tables

-- Create leaderboard table
CREATE TABLE IF NOT EXISTS leaderboard (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    score INTEGER NOT NULL DEFAULT 0,
    date TIMESTAMP DEFAULT NOW()
);

-- Create index for faster score queries
CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON leaderboard(score DESC);

-- Insert some sample data
INSERT INTO leaderboard (username, score, date) VALUES
('ASH', 1500, NOW() - INTERVAL '1 day'),
('MISTY', 1200, NOW() - INTERVAL '2 days'),
('BROCK', 1000, NOW() - INTERVAL '3 days'),
('GARY', 800, NOW() - INTERVAL '4 days'),
('TEAM_ROCKET', 500, NOW() - INTERVAL '5 days');
