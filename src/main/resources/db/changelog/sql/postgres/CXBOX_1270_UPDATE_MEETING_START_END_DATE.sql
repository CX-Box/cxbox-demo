UPDATE meeting
SET
    start_date_time = DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month' + INTERVAL '4 days',
    end_date_time = DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month' + INTERVAL '4 days' + INTERVAL '23 hours 59 minutes'
WHERE id = 1000055;

UPDATE meeting
SET
    start_date_time = DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month' + INTERVAL '8 days',
    end_date_time = DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month' + INTERVAL '12 days' + INTERVAL '23 hours 59 minutes'
WHERE id = 1000056;

UPDATE meeting
SET
    start_date_time = DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month' + INTERVAL '9 days' + INTERVAL '10 hours',
    end_date_time = DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month' + INTERVAL '9 days' + INTERVAL '11 hours 30 minutes'
WHERE id = 1000057;

UPDATE meeting
SET
    start_date_time = DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month' + INTERVAL '17 days' + INTERVAL '14 hours',
    end_date_time = DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month' + INTERVAL '17 days' + INTERVAL '16 hours'
WHERE id = 1000058;

UPDATE meeting
SET
    start_date_time = DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month' + INTERVAL '24 days' + INTERVAL '9 hours 30 minutes',
    end_date_time = DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month' + INTERVAL '24 days' + INTERVAL '11 hours'
WHERE id = 1000059;

UPDATE meeting
SET
    start_date_time = DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '2 days',
    end_date_time = DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '2 days' + INTERVAL '23 hours 59 minutes'
WHERE id = 1000060;

UPDATE meeting
SET
    start_date_time = DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '9 days',
    end_date_time = DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '13 days' + INTERVAL '23 hours 59 minutes'
WHERE id = 1000061;

UPDATE meeting
SET
    start_date_time = DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '11 days' + INTERVAL '10 hours',
    end_date_time = DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '11 days' + INTERVAL '12 hours'
WHERE id = 1000062;

UPDATE meeting
SET
    start_date_time = DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '16 days' + INTERVAL '14 hours 30 minutes',
    end_date_time = DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '16 days' + INTERVAL '16 hours 30 minutes'
WHERE id = 1000063;

UPDATE meeting
SET
    start_date_time = DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '23 days' + INTERVAL '9 hours',
    end_date_time = DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '23 days' + INTERVAL '11 hours'
WHERE id = 1000064;

UPDATE meeting
SET
    start_date_time = DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '27 days' + INTERVAL '15 hours',
    end_date_time = DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '27 days' + INTERVAL '16 hours 30 minutes'
WHERE id = 1000065;

UPDATE meeting
SET
    start_date_time = DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month',
    end_date_time = DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' + INTERVAL '23 hours 59 minutes'
WHERE id = 1000066;

UPDATE meeting
SET
    start_date_time = DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' + INTERVAL '5 days',
    end_date_time = DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' + INTERVAL '9 days' + INTERVAL '23 hours 59 minutes'
WHERE id = 1000067;

UPDATE meeting
SET
    start_date_time = DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' + INTERVAL '7 days' + INTERVAL '10 hours',
    end_date_time = DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' + INTERVAL '7 days' + INTERVAL '12 hours'
WHERE id = 1000068;

UPDATE meeting
SET
    start_date_time = DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' + INTERVAL '14 days' + INTERVAL '13 hours 30 minutes',
    end_date_time = DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' + INTERVAL '14 days' + INTERVAL '17 hours 30 minutes'
WHERE id = 1000069;

UPDATE meeting
SET
    start_date_time = DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' + INTERVAL '21 days' + INTERVAL '9 hours 30 minutes',
    end_date_time = DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' + INTERVAL '21 days' + INTERVAL '11 hours 30 minutes'
WHERE id = 1000070;

UPDATE meeting
SET
    start_date_time = DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' + INTERVAL '28 days' + INTERVAL '14 hours',
    end_date_time = DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' + INTERVAL '28 days' + INTERVAL '16 hours'
WHERE id = 1000071;