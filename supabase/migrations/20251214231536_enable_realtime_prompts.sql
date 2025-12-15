-- Enable real-time for prompts tables
-- This allows the frontend to subscribe to real-time updates on these tables

-- Enable real-time for jailbreak_prompts
ALTER PUBLICATION supabase_realtime ADD TABLE jailbreak_prompts;

-- Enable real-time for compliance_prompts
ALTER PUBLICATION supabase_realtime ADD TABLE compliance_prompts;

-- Enable real-time for hallucination_prompts
ALTER PUBLICATION supabase_realtime ADD TABLE hallucination_prompts;
