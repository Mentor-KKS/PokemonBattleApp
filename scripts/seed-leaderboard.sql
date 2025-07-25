-- Seed the leaderboard with some initial data for testing
-- This script adds sample entries to demonstrate the leaderboard functionality

-- Clear existing data (optional - remove if you want to keep existing entries)
-- DELETE FROM leaderboard;

-- Insert sample leaderboard entries
INSERT INTO leaderboard (username, score, date) VALUES
('CHAMPION_ASH', 2500, NOW() - INTERVAL '1 hour'),
('ELITE_MISTY', 2200, NOW() - INTERVAL '2 hours'),
('MASTER_BROCK', 1800, NOW() - INTERVAL '3 hours'),
('RIVAL_GARY', 1500, NOW() - INTERVAL '4 hours'),
('TRAINER_RED', 1200, NOW() - INTERVAL '5 hours'),
('GYM_LEADER', 1000, NOW() - INTERVAL '6 hours'),
('POKEMON_FAN', 800, NOW() - INTERVAL '1 day'),
('YOUNGSTER', 600, NOW() - INTERVAL '2 days'),
('BUG_CATCHER', 400, NOW() - INTERVAL '3 days'),
('TEAM_ROCKET', 200, NOW() - INTERVAL '4 days');

-- Verify the data was inserted
SELECT * FROM leaderboard ORDER BY score DESC LIMIT 10;
