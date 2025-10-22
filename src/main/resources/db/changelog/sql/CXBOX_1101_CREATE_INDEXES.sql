CREATE INDEX IF NOT EXISTS idx_meeting_start_date ON meeting(start_date_time);
CREATE INDEX IF NOT EXISTS idx_meeting_end_date ON meeting(end_date_time);
CREATE INDEX IF NOT EXISTS idx_meeting_client_id ON meeting(client_id);
CREATE INDEX IF NOT EXISTS idx_meeting_dates_client ON meeting(start_date_time, end_date_time, client_id);
