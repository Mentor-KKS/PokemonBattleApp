-- Test script for leaderboard functionality
-- Run this to test database operations

-- Test 1: Check if table exists and has correct structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'leaderboard'
ORDER BY ordinal_position;

-- Test 2: Count total entries
SELECT COUNT(*) as total_entries FROM leaderboard;

-- Test 3: Get top 10 scores
SELECT 
    username,
    score,
    date,
    ROW_NUMBER() OVER (ORDER BY score DESC) as rank
FROM leaderboard 
ORDER BY score DESC 
LIMIT 10;

-- Test 4: Check for duplicate usernames (should be allowed)
SELECT 
    username, 
    COUNT(*) as entry_count,
    MAX(score) as best_score
FROM leaderboard 
GROUP BY username 
HAVING COUNT(*) > 1
ORDER BY best_score DESC;

-- Test 5: Recent entries (last 24 hours)
SELECT 
    username,
    score,
    date,
    EXTRACT(EPOCH FROM (NOW() - date))/3600 as hours_ago
FROM leaderboard 
WHERE date > NOW() - INTERVAL '24 hours'
ORDER BY date DESC;

-- Test 6: Score distribution
SELECT 
    CASE 
        WHEN score >= 2000 THEN 'Master (2000+)'
        WHEN score >= 1500 THEN 'Expert (1500-1999)'
        WHEN score >= 1000 THEN 'Advanced (1000-1499)'
        WHEN score >= 500 THEN 'Intermediate (500-999)'
        ELSE 'Beginner (0-499)'
    END as skill_level,
    COUNT(*) as player_count,
    AVG(score)::INTEGER as avg_score
FROM leaderboard 
GROUP BY 
    CASE 
        WHEN score >= 2000 THEN 'Master (2000+)'
        WHEN score >= 1500 THEN 'Expert (1500-1999)'
        WHEN score >= 1000 THEN 'Advanced (1000-1499)'
        WHEN score >= 500 THEN 'Intermediate (500-999)'
        ELSE 'Beginner (0-499)'
    END
ORDER BY avg_score DESC;
