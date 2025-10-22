CREATE OR REPLACE VIEW v_calendar_year_meeting AS
SELECT DISTINCT
    CAST(TO_CHAR(date_trunc('day', d.day), 'YYYYMMDD') AS BIGINT) AS id,
    CAST(date_trunc('day', d.day) AS DATE) AS event_date,
    (SELECT COUNT(*)
     FROM meeting m
     WHERE date_trunc('day', m.start_date_time) <= d.day
       AND date_trunc('day', m.end_date_time) >= d.day) AS events_count,
    0 AS vstamp,
    1 AS created_by_user_id,
    1 AS last_upd_by_user_id,
    NOW() AS updated_date,
    NOW() AS created_date
FROM (
         SELECT DISTINCT date_trunc('day', start_date_time) AS day FROM meeting
         UNION
         SELECT DISTINCT date_trunc('day', end_date_time) AS day FROM meeting
     ) d
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
