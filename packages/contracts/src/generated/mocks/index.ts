import { getAttendanceMock } from '../endpoints/attendance/attendance.msw';
import { getAuditMock } from '../endpoints/audit/audit.msw';
import { getAuthMock } from '../endpoints/auth/auth.msw';
import { getBillingIsolationMock } from '../endpoints/billing-isolation/billing-isolation.msw';
import { getCustodyMock } from '../endpoints/custody/custody.msw';
import { getNotificationsMock } from '../endpoints/notifications/notifications.msw';
import { getOfflineMock } from '../endpoints/offline/offline.msw';
import { getPassengersMock } from '../endpoints/passengers/passengers.msw';
import { getRoutesMock } from '../endpoints/routes/routes.msw';
import { getSchoolsMock } from '../endpoints/schools/schools.msw';
import { getStudentsMock } from '../endpoints/students/students.msw';
import { getTelemetryMock } from '../endpoints/telemetry/telemetry.msw';
import { getTrackingMock } from '../endpoints/tracking/tracking.msw';
import { getTransportCompaniesMock } from '../endpoints/transport-companies/transport-companies.msw';
import { getTripsMock } from '../endpoints/trips/trips.msw';

export {
  getAttendanceMock,
  getAuditMock,
  getAuthMock,
  getBillingIsolationMock,
  getCustodyMock,
  getNotificationsMock,
  getOfflineMock,
  getPassengersMock,
  getRoutesMock,
  getSchoolsMock,
  getStudentsMock,
  getTelemetryMock,
  getTrackingMock,
  getTransportCompaniesMock,
  getTripsMock,
};

export const handlers = [
  ...getAttendanceMock(),
  ...getAuditMock(),
  ...getAuthMock(),
  ...getBillingIsolationMock(),
  ...getCustodyMock(),
  ...getNotificationsMock(),
  ...getOfflineMock(),
  ...getPassengersMock(),
  ...getRoutesMock(),
  ...getSchoolsMock(),
  ...getStudentsMock(),
  ...getTelemetryMock(),
  ...getTrackingMock(),
  ...getTransportCompaniesMock(),
  ...getTripsMock(),
];
