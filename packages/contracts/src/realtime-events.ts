/** PROVISIONAL: validar campos y nombre con el contrato Socket.IO del backend. */
export interface ProvisionalBusPositionEvent {
  busId: string;
  latitude: number;
  longitude: number;
  recordedAt: string;
}

/** PROVISIONAL: validar estados y nombre con el contrato Socket.IO del backend. */
export interface ProvisionalStudentStatusEvent {
  studentId: string;
  status: 'A_BORDO_VEHICULO' | 'EN_COLEGIO';
  changedAt: string;
}

export interface RealtimeEventMap {
  'bus.position.updated': ProvisionalBusPositionEvent;
  'student.status.changed': ProvisionalStudentStatusEvent;
}

export type SocketEventName = keyof RealtimeEventMap;

export type ProvisionalRealtimeEvent = {
  [EventName in SocketEventName]: {
    name: EventName;
    payload: RealtimeEventMap[EventName];
  };
}[SocketEventName];
