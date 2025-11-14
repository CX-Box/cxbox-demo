CREATE OR REPLACE VIEW v_calendar_year_meeting AS
SELECT
    CAST(TO_CHAR(d, 'YYYYMMDD') AS BIGINT) AS id,
    CAST(d AS DATE) AS event_date,
    COUNT(m.id) AS events_count,
    0 AS vstamp,
    1 AS created_by_user_id,
    1 AS last_upd_by_user_id,
    NOW() AS updated_date,
    NOW() AS created_date
FROM generate_series(
             (SELECT MIN(date_trunc('day', start_date_time))::DATE FROM meeting),
             (SELECT MAX(date_trunc('day', end_date_time))::DATE FROM meeting),
             INTERVAL '1 day'
     ) AS d
         INNER JOIN meeting m ON
    date_trunc('day', m.start_date_time)::DATE <= CAST(d AS DATE)
    AND date_trunc('day', m.end_date_time)::DATE >= CAST(d AS DATE)
GROUP BY d
HAVING COUNT(m.id) > 0
ORDER BY event_date;

CREATE OR REPLACE VIEW v_meetings_clients AS
SELECT DISTINCT
    CAST(TO_CHAR(d.day, 'YYYYMMDD') AS BIGINT) AS meeting_day_id,
    m.client_id
FROM meeting m
         CROSS JOIN LATERAL generate_series(
                                            CAST(date_trunc('day', m.start_date_time) AS DATE),
                                            CAST(date_trunc('day', m.end_date_time) AS DATE),
    '1 day'::interval
) AS d(day)
WHERE m.client_id IS NOT NULL;
