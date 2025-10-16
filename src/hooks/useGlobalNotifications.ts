import { useEffect } from 'react';
import { toast } from 'sonner';
import { notificationService } from '@/lib/notifications/notification-service';
import { playNotificationSound } from '@/lib/audio/notification-sound';
import { toUrlSlug } from '@/lib/utils';

/**
 * Global notification listener hook
 * Listens for notification events from features and displays toast UI
 * Used only in App.tsx to handle UI rendering
 */
export function useGlobalNotifications() {
  useEffect(() => {
    const unsubscribe = notificationService.subscribe((event) => {
      if (event.type === 'evaluation-completed') {
        const { payload } = event;

        // Show toast notification
        toast.success('Evaluation Completed', {
          description: payload.evaluationName,
          duration: 10000, // Extended duration to give user time to interact
          classNames: {
            toast: 'border-gray-200 bg-gray-0 shadow-lg',
            title: 'text-gray-900 font-450 text-[13px] line-clamp-1',
            description: 'text-gray-500 text-xs',
            actionButton: 'bg-gray-100  text-gray-900 border border-gray-200 hover:bg-gray-100 font-medium',
            cancelButton: 'hidden', // Hide the cancel button, use close icon instead
          },
          action: {
            label: 'View Results',
            onClick: () => {
              // Navigate to AI system evaluation results page
              // Convert system name to URL slug format (e.g., "GPT-4o Demo" -> "gpt-4o-demo")
              const systemSlug = toUrlSlug(payload.systemName);
              window.location.href = `/ai-systems/${systemSlug}/evaluation/${payload.evaluationId}/summary`;
            },
          },
          closeButton: true, // Show X icon in top-right corner
        });

        // Play notification sound
        playNotificationSound();

        console.log('📢 Global notification displayed:', payload);
      }
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);
}
