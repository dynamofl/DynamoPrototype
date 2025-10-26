-- Add risk_combinations column to evaluations table
-- This stores the logistic regression analysis of attack area × attack type combinations

ALTER TABLE evaluations
ADD COLUMN IF NOT EXISTS risk_combinations JSONB;

-- Add comment to describe the column
COMMENT ON COLUMN evaluations.risk_combinations IS 'Risk combinations analysis: logistic regression results for attack area × attack type combinations with attack success rate > 75%';
