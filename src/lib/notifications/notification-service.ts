/**
 * Global notification service using custom events
 * Allows features to trigger notifications without App.tsx needing to know about feature-specific data
 */

export interface EvaluationCompletionNotification {
  evaluationId: string;
  evaluationName: string;
  systemName: string;
  title: string;
  description: string;
}

export type NotificationEvent = {
  type: 'evaluation-completed';
  payload: EvaluationCompletionNotification;
};

class NotificationService {
  private eventTarget = new EventTarget();

  /**
   * Trigger an evaluation completion notification
   * Called by features when an evaluation completes
   */
  triggerEvaluationCompletion(notification: EvaluationCompletionNotification) {
    console.log('🔔 NotificationService: Triggering evaluation completion', notification);
    const event = new CustomEvent<NotificationEvent>('notification', {
      detail: {
        type: 'evaluation-completed',
        payload: notification,
      },
    });
    this.eventTarget.dispatchEvent(event);
    console.log('✅ NotificationService: Event dispatched');
  }

  /**
   * Subscribe to notifications
   * Used by App.tsx to listen for notification events
   */
  subscribe(callback: (event: NotificationEvent) => void) {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<NotificationEvent>;
      callback(customEvent.detail);
    };

    this.eventTarget.addEventListener('notification', handler);

    // Return cleanup function
    return () => {
      this.eventTarget.removeEventListener('notification', handler);
    };
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
