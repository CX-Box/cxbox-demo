CREATE OR REPLACE VIEW USER_DIVISIONS (USER_ID, DIVISIONS) AS
SELECT u.id         AS user_id,
       ud.divisions as divisions
FROM users u
         left join
     (SELECT STRING_AGG(full_name, ',') as divisions,
             ur.id                      as user_id
      FROM user_role ur,
           division d
      WHERE ur.division_id = d.id
      group by ur.id
     ) ud
     on u.id = ud.user_id;

