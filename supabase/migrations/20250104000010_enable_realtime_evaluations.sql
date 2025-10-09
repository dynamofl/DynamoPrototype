-- Migration: Enable realtime for evaluations table
-- Purpose: Allow frontend to receive real-time progress updates during evaluation execution

-- Enable realtime for evaluations table
ALTER PUBLICATION supabase_realtime ADD TABLE evaluations;

-- Add comment
COMMENT ON TABLE evaluations IS 'Evaluations table with realtime enabled for progress updates';
