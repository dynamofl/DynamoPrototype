import { createClient } from 'jsr:@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

export type CheckpointId = 'topics' | 'prompts' | 'evaluation' | 'summary';
export type CheckpointStatus = 'pending' | 'in_progress' | 'completed';

export interface CheckpointData {
  status: CheckpointStatus;
  started_at?: string;
  completed_at?: string;
  data?: any;
}

export interface CheckpointState {
  current_checkpoint: CheckpointId;
  checkpoints: {
    topics: CheckpointData;
    prompts: CheckpointData;
    evaluation: CheckpointData;
    summary: CheckpointData;
  };
  policies?: any;
}

/**
 * Centralized checkpoint state management for evaluation process.
 * Ensures consistency across create-evaluation and run-evaluation edge functions.
 */
export class CheckpointManager {
  private supabase;

  constructor() {
    this.supabase = createClient(supabaseUrl, supabaseServiceKey);
  }

  /**
   * Initialize checkpoint state with all checkpoints set to pending except topics.
   * Should be called once when evaluation is first created.
   */
  async initializeCheckpointState(
    evaluationId: string,
    policies?: any
  ): Promise<CheckpointState> {
    const initialState: CheckpointState = {
      current_checkpoint: 'topics',
      checkpoints: {
        topics: {
          status: 'in_progress',
          started_at: new Date().toISOString()
        },
        prompts: { status: 'pending' },
        evaluation: { status: 'pending' },
        summary: { status: 'pending' }
      },
      policies
    };

    const { error } = await this.supabase
      .from('evaluations')
      .update({ checkpoint_state: initialState })
      .eq('id', evaluationId);

    if (error) {
      throw new Error(`Failed to initialize checkpoint state: ${error.message}`);
    }

    return initialState;
  }

  /**
   * Get current checkpoint state from database.
   */
  async getCheckpointState(evaluationId: string): Promise<CheckpointState | null> {
    const { data, error } = await this.supabase
      .from('evaluations')
      .select('checkpoint_state')
      .eq('id', evaluationId)
      .single();

    if (error) {
      throw new Error(`Failed to get checkpoint state: ${error.message}`);
    }

    return data?.checkpoint_state || null;
  }

  /**
   * Get status of a specific checkpoint.
   */
  async getCheckpointStatus(
    evaluationId: string,
    checkpointId: CheckpointId
  ): Promise<CheckpointStatus | null> {
    const state = await this.getCheckpointState(evaluationId);
    return state?.checkpoints[checkpointId]?.status || null;
  }

  /**
   * Get the current active checkpoint.
   */
  async getCurrentCheckpoint(evaluationId: string): Promise<CheckpointId | null> {
    const state = await this.getCheckpointState(evaluationId);
    return state?.current_checkpoint || null;
  }

  /**
   * Mark a checkpoint as started (in_progress).
   * IMPORTANT: Only call this when checkpoint actually begins processing.
   */
  async markCheckpointStarted(
    evaluationId: string,
    checkpointId: CheckpointId
  ): Promise<void> {
    const state = await this.getCheckpointState(evaluationId);
    if (!state) {
      throw new Error('Checkpoint state not found');
    }

    state.checkpoints[checkpointId] = {
      ...state.checkpoints[checkpointId],
      status: 'in_progress',
      started_at: new Date().toISOString()
    };
    state.current_checkpoint = checkpointId;

    const { error } = await this.supabase
      .from('evaluations')
      .update({ checkpoint_state: state })
      .eq('id', evaluationId);

    if (error) {
      throw new Error(`Failed to mark checkpoint started: ${error.message}`);
    }

    console.log(`✓ Checkpoint '${checkpointId}' marked as started`);
  }

  /**
   * Mark a checkpoint as completed.
   */
  async markCheckpointCompleted(
    evaluationId: string,
    checkpointId: CheckpointId,
    data?: any
  ): Promise<void> {
    const state = await this.getCheckpointState(evaluationId);
    if (!state) {
      throw new Error('Checkpoint state not found');
    }

    state.checkpoints[checkpointId] = {
      ...state.checkpoints[checkpointId],
      status: 'completed',
      completed_at: new Date().toISOString(),
      ...(data && { data })
    };

    const { error } = await this.supabase
      .from('evaluations')
      .update({ checkpoint_state: state })
      .eq('id', evaluationId);

    if (error) {
      throw new Error(`Failed to mark checkpoint completed: ${error.message}`);
    }

    console.log(`✓ Checkpoint '${checkpointId}' marked as completed`);
  }

  /**
   * Update a specific checkpoint with custom status and data.
   * Use this for more granular control when needed.
   */
  async updateCheckpoint(
    evaluationId: string,
    checkpointId: CheckpointId,
    status: CheckpointStatus,
    data?: any
  ): Promise<void> {
    const state = await this.getCheckpointState(evaluationId);
    if (!state) {
      throw new Error('Checkpoint state not found');
    }

    const timestamp = new Date().toISOString();
    const updates: Partial<CheckpointData> = { status };

    if (status === 'in_progress' && !state.checkpoints[checkpointId].started_at) {
      updates.started_at = timestamp;
    }

    if (status === 'completed') {
      updates.completed_at = timestamp;
    }

    if (data) {
      updates.data = data;
    }

    state.checkpoints[checkpointId] = {
      ...state.checkpoints[checkpointId],
      ...updates
    };

    // Update current checkpoint if moving to in_progress
    if (status === 'in_progress') {
      state.current_checkpoint = checkpointId;
    }

    const { error } = await this.supabase
      .from('evaluations')
      .update({ checkpoint_state: state })
      .eq('id', evaluationId);

    if (error) {
      throw new Error(`Failed to update checkpoint: ${error.message}`);
    }

    console.log(`✓ Checkpoint '${checkpointId}' updated to '${status}'`);
  }

  /**
   * Move to the next checkpoint.
   * Marks current checkpoint as completed and sets next as current.
   */
  async moveToNextCheckpoint(
    evaluationId: string,
    fromCheckpoint: CheckpointId,
    toCheckpoint: CheckpointId,
    completionData?: any
  ): Promise<void> {
    const state = await this.getCheckpointState(evaluationId);
    if (!state) {
      throw new Error('Checkpoint state not found');
    }

    const timestamp = new Date().toISOString();

    // Mark current checkpoint as completed
    state.checkpoints[fromCheckpoint] = {
      ...state.checkpoints[fromCheckpoint],
      status: 'completed',
      completed_at: timestamp,
      ...(completionData && { data: completionData })
    };

    // Set next checkpoint as current (but keep it pending until explicitly started)
    state.current_checkpoint = toCheckpoint;

    const { error } = await this.supabase
      .from('evaluations')
      .update({ checkpoint_state: state })
      .eq('id', evaluationId);

    if (error) {
      throw new Error(`Failed to move to next checkpoint: ${error.message}`);
    }

    console.log(`✓ Moved from '${fromCheckpoint}' (completed) to '${toCheckpoint}' (current)`);
  }

  /**
   * Clear checkpoint data from a specific checkpoint onwards.
   * Used for restart-from-checkpoint functionality.
   */
  async clearCheckpointsFrom(
    evaluationId: string,
    fromCheckpoint: CheckpointId
  ): Promise<void> {
    const state = await this.getCheckpointState(evaluationId);
    if (!state) {
      throw new Error('Checkpoint state not found');
    }

    const checkpointOrder: CheckpointId[] = ['topics', 'prompts', 'evaluation', 'summary'];
    const fromIndex = checkpointOrder.indexOf(fromCheckpoint);

    // Reset all checkpoints from this point onwards
    for (let i = fromIndex; i < checkpointOrder.length; i++) {
      const checkpoint = checkpointOrder[i];
      state.checkpoints[checkpoint] = { status: 'pending' };
    }

    // Set current checkpoint to the one we're restarting from
    state.current_checkpoint = fromCheckpoint;

    const { error } = await this.supabase
      .from('evaluations')
      .update({ checkpoint_state: state })
      .eq('id', evaluationId);

    if (error) {
      throw new Error(`Failed to clear checkpoints: ${error.message}`);
    }

    console.log(`✓ Cleared checkpoints from '${fromCheckpoint}' onwards`);
  }
}

// Export singleton instance
export const checkpointManager = new CheckpointManager();
