-- Add rsvp_status to gala_members table
ALTER TABLE gala_members
ADD COLUMN rsvp_status VARCHAR(20) DEFAULT 'pending' CHECK (rsvp_status IN ('pending', 'confirmed'));

-- Create index for quick queries
CREATE INDEX idx_gala_members_rsvp ON gala_members(gala_id, rsvp_status);
