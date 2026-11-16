import type {
  Booking,
  HhmmString,
  Id,
  ScheduleBlock,
  ShopHours,
  Timeblock,
  WorkingHours,
  YmdString,
} from "@/shared/types"

export interface ScheduleData {
  shopHours: ShopHours
  workingHours: WorkingHours[]
  blocks: ScheduleBlock[]
  timeblocks: Timeblock[]
}
export interface ScheduleConflict {
  bookings: Booking[]
}

export interface TimeblockInput {
  id?: Id
  barberId: Id
  startDate: YmdString
  startTime: HhmmString
  endDate: YmdString
  endTime: HhmmString
  allDay: boolean
  reason: string
}
