CREATE OR REPLACE VIEW v_calendar_year_meeting AS
SELECT DISTINCT
    TO_NUMBER(TO_CHAR(TRUNC(d.day), 'YYYYMMDD')) AS id,
    TRUNC(d.day) AS event_date,
    (SELECT COUNT(*)
     FROM meeting m
     WHERE TRUNC(m.start_date_time) <= TRUNC(d.day)
       AND TRUNC(m.end_date_time) >= TRUNC(d.day)) AS events_count,
    0 AS vstamp,
    1 AS created_by_user_id,
    1 AS last_upd_by_user_id,
    SYSDATE AS updated_date,
    SYSDATE AS created_date
FROM (
         SELECT DISTINCT TRUNC(start_date_time) AS day FROM meeting
         UNION
         SELECT DISTINCT TRUNC(end_date_time) AS day FROM meeting
     ) d
ORDER BY event_date;

CREATE OR REPLACE VIEW v_meetings_clients AS
SELECT DISTINCT
    TO_NUMBER(TO_CHAR(TRUNC(m.start_date_time) + (LEVEL - 1), 'YYYYMMDD')) AS meeting_day_id,
    m.client_id
FROM meeting m
WHERE m.client_id IS NOT NULL
  AND TRUNC(m.start_date_time) + (LEVEL - 1) <= TRUNC(m.end_date_time)
    CONNECT BY PRIOR m.meeting_id = m.meeting_id
       AND LEVEL <= TRUNC(m.end_date_time) - TRUNC(m.start_date_time) + 1
       AND PRIOR sys_guid() IS NOT NULL;