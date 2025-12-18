/**
 * Re-export useTimelineContext from TimelineProvider
 * This provides a cleaner import path for consumers
 */
export { useTimelineContext } from '../components/TimelineProvider';
export type {
  TimelineState,
  TimelineActions,
  TimelineContextValue,
} from '../components/TimelineProvider';
