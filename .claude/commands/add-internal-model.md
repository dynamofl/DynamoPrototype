# Add Internal Model for Evaluation

You need to configure internal models that are used during evaluation processes. Follow these steps:

## Step 1: Navigate to Settings
1. Go to **Settings** → **Internal Models Usage** in the sidebar

## Step 2: Add a New Model (if not already added)
1. Click the **"Add Model"** button in the "Available Internal Usage Models" section
2. Fill in the model details:
   - **Name**: Give it a descriptive name (e.g., "GPT-4o for Analysis", "Claude Sonnet for Insights")
   - **Provider**: Select from OpenAI, Azure, or Anthropic
   - **API Key**: Enter your API key for the selected provider
   - **Model ID**: Enter the model identifier
     - OpenAI examples: `gpt-4o`, `gpt-4-turbo`, `gpt-3.5-turbo`
     - Anthropic examples: `claude-3-5-sonnet-20241022`, `claude-3-opus-20240229`
     - Azure: Your deployment name
3. Click **"Save"**

## Step 3: Assign Models to Internal Tasks

In the left section, you'll see different internal task cards. Assign your models to the appropriate tasks:

### Available Internal Tasks:

1. **Input Guardrail Model**
   - Evaluates prompts for safety before sending to your AI system
   - Recommended: Fast models like `gpt-3.5-turbo` or `claude-3-haiku`

2. **Output Guardrail Model**
   - Evaluates AI responses for safety after generation
   - Recommended: Fast models like `gpt-3.5-turbo` or `claude-3-haiku`

3. **Judge Model**
   - Determines whether the AI answered or refused the user's question
   - Recommended: Accurate models like `gpt-4o` or `claude-3-5-sonnet`

4. **Topic Insight Model** ⭐ NEW
   - Analyzes topic statistics and generates insights about attack patterns and model behavior
   - Recommended: Reasoning models like `gpt-4o`, `o1-mini`, or `claude-3-5-sonnet`
   - **What it does**:
     - Analyzes correlations between attack success rates, confidence scores, runtime, and output length
     - Identifies high-risk topics and statistically significant vulnerabilities
     - Describes model behavior patterns (e.g., longer responses when jailbroken)
     - Provides 3-5 sentence summary with actionable insights
   - **Output example**: "Higher attack success rates (80% for Legal Requirements) correlate with longer response outputs and maintained confidence levels, suggesting the model confidently produces detailed answers even when jailbroken. Three of five topics show statistically significant vulnerabilities."

5. **Topic Generation**
   - Analyzes policies and generates test topics from allowed and disallowed behaviors
   - Recommended: Creative models like `gpt-4o` or `claude-3-5-sonnet`

6. **Prompt Generation**
   - Generates base test prompts and adversarial variants using various attack techniques
   - Recommended: Creative models like `gpt-4o` or `claude-3-5-sonnet`

7. **Evaluation & Judgement**
   - Evaluates guardrail effectiveness and judges responses
   - Recommended: Accurate models like `gpt-4o` or `claude-3-5-sonnet`

8. **Test Execution**
   - Runs comprehensive jailbreak tests and safety evaluations
   - Recommended: Any model you want to use for general evaluation tasks

## Step 4: Select Model for Each Task
1. Click the dropdown in each card
2. Select a model from your available models
3. You can select "None" if you don't want to use that specific task
4. The assignment is saved automatically

## Important Rules:

### 🚨 Critical Models (Required for most evaluations):
- **Judge Model**: Required to determine if AI system answered or refused
- **Topic Generation**: Required if you want topic-level analysis
- **Prompt Generation**: Required for generating test prompts

### 💡 Optional but Recommended:
- **Topic Insight Model**: Generates AI-powered insights from topic statistics
  - Only works if you have topic analysis data
  - Requires a model to be assigned
  - Adds `topic_insight` field to completed evaluations
- **Input/Output Guardrail Models**: Only needed if you're testing with guardrails
- **Evaluation & Judgement**: Useful for complex evaluation scenarios

### 📊 Model Selection Best Practices:

1. **Cost vs Quality Trade-off**:
   - Use cheaper models (gpt-3.5-turbo) for high-volume tasks (guardrails)
   - Use premium models (gpt-4o, claude-3-5-sonnet) for accuracy-critical tasks (judge, insights)

2. **Speed Considerations**:
   - Input/Output Guardrails: Use fast models (evaluated for every prompt)
   - Topic Insights: Can use slower models (only run once per evaluation)

3. **Provider Diversity**:
   - Consider using different providers for different tasks
   - Reduces dependency on a single API provider
   - Can mix OpenAI for speed and Anthropic for analysis

4. **API Key Management**:
   - Each model stores its own API key
   - API keys are stored in your browser's localStorage
   - Never shared or logged
   - Passed securely to backend only during evaluation

### 🔄 Updating Models:
- You can change model assignments at any time
- New assignments only affect **future evaluations**
- Existing evaluations keep using the models they were created with

### 🗑️ Deleting Models:
- Click the trash icon on a model card to delete it
- You cannot delete a model that is currently assigned to a task
- Unassign it first, then delete

## Verifying Configuration:

After assignment, you'll see:
- The selected model name displayed in each card
- A console log when creating a new evaluation showing which models are being used
- Example: `💡 Topic Insight Model: GPT-4o Analysis (OpenAI/gpt-4o)`

## Troubleshooting:

**Topic Insights showing null?**
- Make sure you assigned a model to "Topic Insight Model"
- The assignment must be done BEFORE creating the evaluation
- Existing evaluations won't get insights unless you run the backfill script
- Check browser console for: `💡 Topic Insight Model: ...` message when creating evaluation

**Model not appearing in dropdown?**
- Refresh the page
- Check that the model was saved successfully
- Verify the model shows in "Available Internal Usage Models" section

**API errors during evaluation?**
- Verify your API key is correct
- Check API key has sufficient credits/quota
- Ensure the Model ID is spelled correctly

## Example Configuration:

**Budget-Conscious Setup** (OpenAI only):
- Input Guardrail: `gpt-3.5-turbo`
- Output Guardrail: `gpt-3.5-turbo`
- Judge Model: `gpt-4o`
- Topic Insight: `gpt-4o`
- Topic Generation: `gpt-4o`
- Prompt Generation: `gpt-4o`

**Premium Setup** (Mixed providers):
- Input Guardrail: `gpt-3.5-turbo` (OpenAI)
- Output Guardrail: `gpt-3.5-turbo` (OpenAI)
- Judge Model: `claude-3-5-sonnet-20241022` (Anthropic)
- Topic Insight: `claude-3-5-sonnet-20241022` (Anthropic)
- Topic Generation: `gpt-4o` (OpenAI)
- Prompt Generation: `gpt-4o` (OpenAI)

## Next Steps:

After configuring your models:
1. Go to **AI Systems** page
2. Create a new evaluation
3. Your configured models will be used automatically
4. After evaluation completes, check the `topic_insight` field for AI-generated insights!
