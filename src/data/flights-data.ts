import type { Flight, Disruption, ClaimDocument } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function iso(date: string, time: string) {
  return `${date}T${time}:00.000Z`;
}

function addMins(isoStr: string, mins: number) {
  const d = new Date(isoStr);
  d.setMinutes(d.getMinutes() + mins);
  return d.toISOString();
}

function field(
  name: string,
  value: string,
  confidence: number,
  override?: { overriddenValue: string; overrideReason: string },
) {
  return { name, value, confidence, ...override };
}

// ─────────────────────────────────────────────────────────────────────────────
// Flights
// ─────────────────────────────────────────────────────────────────────────────

export const mockFlights: Flight[] = [
  // ── Air India ──────────────────────────────────────────────────────────────
  {
    id: 'FLT-001',
    flightNumber: 'AI-101',
    routeOrigin: 'DEL',
    routeDestination: 'LHR',
    originCity: 'Delhi',
    destinationCity: 'London',
    scheduledDeparture: iso('2025-10-05', '01:30'),
    actualDeparture: iso('2025-10-05', '04:15'),
    scheduledArrival: iso('2025-10-05', '07:00'),
    actualArrival: iso('2025-10-05', '09:50'),
    aircraftType: 'Boeing 787-8',
  },
  {
    id: 'FLT-002',
    flightNumber: 'AI-302',
    routeOrigin: 'BOM',
    routeDestination: 'JFK',
    originCity: 'Mumbai',
    destinationCity: 'New York',
    scheduledDeparture: iso('2025-10-18', '02:10'),
    actualDeparture: iso('2025-10-18', '02:10'),
    scheduledArrival: iso('2025-10-18', '09:55'),
    actualArrival: iso('2025-10-18', '09:55'),
    aircraftType: 'Boeing 777-200LR',
  },
  {
    id: 'FLT-003',
    flightNumber: 'AI-544',
    routeOrigin: 'MAA',
    routeDestination: 'SIN',
    originCity: 'Chennai',
    destinationCity: 'Singapore',
    scheduledDeparture: iso('2025-11-02', '23:45'),
    actualDeparture: iso('2025-11-03', '05:10'),
    scheduledArrival: iso('2025-11-03', '06:20'),
    actualArrival: iso('2025-11-03', '11:45'),
    aircraftType: 'Airbus A321neo',
  },

  // ── IndiGo ─────────────────────────────────────────────────────────────────
  {
    id: 'FLT-004',
    flightNumber: '6E-2045',
    routeOrigin: 'DEL',
    routeDestination: 'BOM',
    originCity: 'Delhi',
    destinationCity: 'Mumbai',
    scheduledDeparture: iso('2025-11-14', '06:00'),
    actualDeparture: iso('2025-11-14', '06:00'),
    scheduledArrival: iso('2025-11-14', '08:05'),
    actualArrival: iso('2025-11-14', '08:05'),
    aircraftType: 'Airbus A320neo',
  },
  {
    id: 'FLT-005',
    flightNumber: '6E-1780',
    routeOrigin: 'BLR',
    routeDestination: 'HYD',
    originCity: 'Bengaluru',
    destinationCity: 'Hyderabad',
    scheduledDeparture: iso('2025-11-28', '09:15'),
    actualDeparture: iso('2025-11-28', '11:40'),
    scheduledArrival: iso('2025-11-28', '10:25'),
    actualArrival: iso('2025-11-28', '12:55'),
    aircraftType: 'Airbus A320',
  },
  {
    id: 'FLT-006',
    flightNumber: '6E-6312',
    routeOrigin: 'CCU',
    routeDestination: 'DEL',
    originCity: 'Kolkata',
    destinationCity: 'Delhi',
    scheduledDeparture: iso('2025-12-03', '14:30'),
    actualDeparture: iso('2025-12-03', '14:30'),
    scheduledArrival: iso('2025-12-03', '16:55'),
    actualArrival: iso('2025-12-03', '16:55'),
    aircraftType: 'Airbus A321',
  },

  // ── Emirates ───────────────────────────────────────────────────────────────
  {
    id: 'FLT-007',
    flightNumber: 'EK-500',
    routeOrigin: 'DXB',
    routeDestination: 'LHR',
    originCity: 'Dubai',
    destinationCity: 'London',
    scheduledDeparture: iso('2025-12-10', '08:30'),
    actualDeparture: iso('2025-12-10', '08:30'),
    scheduledArrival: iso('2025-12-10', '13:00'),
    actualArrival: iso('2025-12-10', '13:00'),
    aircraftType: 'Airbus A380-800',
  },
  {
    id: 'FLT-008',
    flightNumber: 'EK-202',
    routeOrigin: 'DXB',
    routeDestination: 'LAX',
    originCity: 'Dubai',
    destinationCity: 'Los Angeles',
    scheduledDeparture: iso('2025-12-22', '10:15'),
    actualDeparture: iso('2025-12-22', '10:15'),
    scheduledArrival: iso('2025-12-22', '15:40'),
    actualArrival: iso('2025-12-22', '15:40'),
    aircraftType: 'Boeing 777-300ER',
  },
  {
    id: 'FLT-009',
    flightNumber: 'EK-524',
    routeOrigin: 'BOM',
    routeDestination: 'DXB',
    originCity: 'Mumbai',
    destinationCity: 'Dubai',
    scheduledDeparture: iso('2026-01-07', '03:00'),
    actualDeparture: iso('2026-01-07', '03:00'),
    scheduledArrival: iso('2026-01-07', '05:10'),
    actualArrival: iso('2026-01-07', '05:10'),
    aircraftType: 'Boeing 777-200LR',
  },

  // ── British Airways ────────────────────────────────────────────────────────
  {
    id: 'FLT-010',
    flightNumber: 'BA-118',
    routeOrigin: 'LHR',
    routeDestination: 'JFK',
    originCity: 'London',
    destinationCity: 'New York',
    scheduledDeparture: iso('2026-01-12', '11:00'),
    actualDeparture: iso('2026-01-12', '13:45'),
    scheduledArrival: iso('2026-01-12', '14:05'),
    actualArrival: iso('2026-01-12', '16:50'),
    aircraftType: 'Boeing 747-400',
  },
  {
    id: 'FLT-011',
    flightNumber: 'BA-256',
    routeOrigin: 'LHR',
    routeDestination: 'DEL',
    originCity: 'London',
    destinationCity: 'Delhi',
    scheduledDeparture: iso('2026-01-20', '21:45'),
    actualDeparture: iso('2026-01-20', '21:45'),
    scheduledArrival: iso('2026-01-21', '10:55'),
    actualArrival: iso('2026-01-21', '10:55'),
    aircraftType: 'Boeing 787-9',
  },

  // ── Qatar Airways ──────────────────────────────────────────────────────────
  {
    id: 'FLT-012',
    flightNumber: 'QR-551',
    routeOrigin: 'DOH',
    routeDestination: 'SYD',
    originCity: 'Doha',
    destinationCity: 'Sydney',
    scheduledDeparture: iso('2026-01-29', '02:20'),
    actualDeparture: iso('2026-01-29', '02:20'),
    scheduledArrival: iso('2026-01-29', '22:00'),
    actualArrival: iso('2026-01-29', '22:00'),
    aircraftType: 'Airbus A350-1000',
  },
  {
    id: 'FLT-013',
    flightNumber: 'QR-4',
    routeOrigin: 'DOH',
    routeDestination: 'LHR',
    originCity: 'Doha',
    destinationCity: 'London',
    scheduledDeparture: iso('2026-02-05', '07:55'),
    actualDeparture: iso('2026-02-05', '07:55'),
    scheduledArrival: iso('2026-02-05', '13:15'),
    actualArrival: iso('2026-02-05', '13:15'),
    aircraftType: 'Airbus A380',
  },

  // ── Singapore Airlines ─────────────────────────────────────────────────────
  {
    id: 'FLT-014',
    flightNumber: 'SQ-307',
    routeOrigin: 'SIN',
    routeDestination: 'NRT',
    originCity: 'Singapore',
    destinationCity: 'Tokyo',
    scheduledDeparture: iso('2026-02-11', '09:40'),
    actualDeparture: iso('2026-02-11', '09:40'),
    scheduledArrival: iso('2026-02-11', '17:30'),
    actualArrival: iso('2026-02-11', '17:30'),
    aircraftType: 'Airbus A380-800',
  },
  {
    id: 'FLT-015',
    flightNumber: 'SQ-21',
    routeOrigin: 'SIN',
    routeDestination: 'EWR',
    originCity: 'Singapore',
    destinationCity: 'Newark',
    scheduledDeparture: iso('2026-02-19', '23:55'),
    actualDeparture: iso('2026-02-20', '02:30'),
    scheduledArrival: iso('2026-02-20', '05:30'),
    actualArrival: iso('2026-02-20', '08:05'),
    aircraftType: 'Airbus A350-900ULR',
  },

  // ── Lufthansa ──────────────────────────────────────────────────────────────
  {
    id: 'FLT-016',
    flightNumber: 'LH-761',
    routeOrigin: 'FRA',
    routeDestination: 'BOM',
    originCity: 'Frankfurt',
    destinationCity: 'Mumbai',
    scheduledDeparture: iso('2026-02-26', '22:10'),
    actualDeparture: iso('2026-02-26', '22:10'),
    scheduledArrival: iso('2026-02-27', '09:25'),
    actualArrival: iso('2026-02-27', '09:25'),
    aircraftType: 'Airbus A340-600',
  },
  {
    id: 'FLT-017',
    flightNumber: 'LH-400',
    routeOrigin: 'FRA',
    routeDestination: 'JFK',
    originCity: 'Frankfurt',
    destinationCity: 'New York',
    scheduledDeparture: iso('2026-03-04', '10:30'),
    actualDeparture: iso('2026-03-04', '13:55'),
    scheduledArrival: iso('2026-03-04', '13:35'),
    actualArrival: iso('2026-03-04', '16:59'),
    aircraftType: 'Boeing 747-8',
  },
  {
    id: 'FLT-018',
    flightNumber: 'LH-2040',
    routeOrigin: 'MUC',
    routeDestination: 'CDG',
    originCity: 'Munich',
    destinationCity: 'Paris',
    scheduledDeparture: iso('2026-03-09', '07:00'),
    actualDeparture: iso('2026-03-09', '07:00'),
    scheduledArrival: iso('2026-03-09', '08:40'),
    actualArrival: iso('2026-03-09', '08:40'),
    aircraftType: 'Airbus A321',
  },

  // ── American Airlines ──────────────────────────────────────────────────────
  {
    id: 'FLT-019',
    flightNumber: 'AA-100',
    routeOrigin: 'JFK',
    routeDestination: 'LHR',
    originCity: 'New York',
    destinationCity: 'London',
    scheduledDeparture: iso('2026-03-12', '18:10'),
    actualDeparture: iso('2026-03-12', '18:10'),
    scheduledArrival: iso('2026-03-13', '06:30'),
    actualArrival: iso('2026-03-13', '06:30'),
    aircraftType: 'Boeing 777-300ER',
  },
  {
    id: 'FLT-020',
    flightNumber: 'AA-2431',
    routeOrigin: 'ORD',
    routeDestination: 'MIA',
    originCity: 'Chicago',
    destinationCity: 'Miami',
    scheduledDeparture: iso('2026-03-15', '08:45'),
    actualDeparture: iso('2026-03-15', '11:20'),
    scheduledArrival: iso('2026-03-15', '12:45'),
    actualArrival: iso('2026-03-15', '15:20'),
    aircraftType: 'Boeing 737-800',
  },
  {
    id: 'FLT-021',
    flightNumber: 'AA-985',
    routeOrigin: 'DFW',
    routeDestination: 'NRT',
    originCity: 'Dallas',
    destinationCity: 'Tokyo',
    scheduledDeparture: iso('2026-03-17', '12:30'),
    actualDeparture: iso('2026-03-17', '12:30'),
    scheduledArrival: iso('2026-03-18', '16:50'),
    actualArrival: iso('2026-03-18', '16:50'),
    aircraftType: 'Boeing 787-9',
  },
  {
    id: 'FLT-022',
    flightNumber: 'AA-71',
    routeOrigin: 'LAX',
    routeDestination: 'SYD',
    originCity: 'Los Angeles',
    destinationCity: 'Sydney',
    scheduledDeparture: iso('2026-03-19', '22:30'),
    actualDeparture: iso('2026-03-19', '22:30'),
    scheduledArrival: iso('2026-03-21', '09:15'),
    actualArrival: iso('2026-03-21', '09:15'),
    aircraftType: 'Boeing 787-9',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Disruptions — 9 cancellations, 8 delays, 3 denied boarding, 2 diversions
// ─────────────────────────────────────────────────────────────────────────────

export const mockDisruptions: Disruption[] = [
  // ── Cancellations (9) ──────────────────────────────────────────────────────
  {
    id: 'DIS-001',
    flightId: 'FLT-003',
    type: 'cancellation',
    reasonCode: 'WX-STORM',
    reasonDescription: 'Severe thunderstorm activity over destination airport',
    durationMinutes: 0,
    noticeHours: 1.5,
    alternativeOffered: true,
  },
  {
    id: 'DIS-002',
    flightId: 'FLT-004',
    type: 'cancellation',
    reasonCode: 'OPS-CREW',
    reasonDescription: 'Flight crew exceeded maximum duty hours; no standby crew available',
    durationMinutes: 0,
    noticeHours: 3,
    alternativeOffered: true,
  },
  {
    id: 'DIS-003',
    flightId: 'FLT-006',
    type: 'cancellation',
    reasonCode: 'MX-AOG',
    reasonDescription: 'Aircraft on ground — unscheduled engine maintenance required',
    durationMinutes: 0,
    noticeHours: 0.5,
    alternativeOffered: false,
  },
  {
    id: 'DIS-004',
    flightId: 'FLT-009',
    type: 'cancellation',
    reasonCode: 'OPS-SLOT',
    reasonDescription: 'Airport slot cancellation due to ATC capacity restrictions',
    durationMinutes: 0,
    noticeHours: 6,
    alternativeOffered: true,
  },
  {
    id: 'DIS-005',
    flightId: 'FLT-011',
    type: 'cancellation',
    reasonCode: 'WX-FOG',
    reasonDescription: 'Dense fog reducing visibility below Category III minimums',
    durationMinutes: 0,
    noticeHours: 2,
    alternativeOffered: true,
  },
  {
    id: 'DIS-006',
    flightId: 'FLT-013',
    type: 'cancellation',
    reasonCode: 'MX-BIRD',
    reasonDescription: 'Bird strike damage on primary engine during previous sector',
    durationMinutes: 0,
    noticeHours: 4,
    alternativeOffered: true,
  },
  {
    id: 'DIS-007',
    flightId: 'FLT-016',
    type: 'cancellation',
    reasonCode: 'OPS-STRIKE',
    reasonDescription: 'Ground-handling staff industrial action at origin airport',
    durationMinutes: 0,
    noticeHours: 12,
    alternativeOffered: false,
  },
  {
    id: 'DIS-008',
    flightId: 'FLT-018',
    type: 'cancellation',
    reasonCode: 'SEC-THREAT',
    reasonDescription: 'Security alert necessitating full aircraft inspection and evacuation',
    durationMinutes: 0,
    noticeHours: 0.25,
    alternativeOffered: true,
  },
  {
    id: 'DIS-009',
    flightId: 'FLT-021',
    type: 'cancellation',
    reasonCode: 'OPS-LOW-LOAD',
    reasonDescription: 'Commercial cancellation due to critically low load factor',
    durationMinutes: 0,
    noticeHours: 48,
    alternativeOffered: true,
  },

  // ── Delays (8) ─────────────────────────────────────────────────────────────
  {
    id: 'DIS-010',
    flightId: 'FLT-001',
    type: 'delay',
    reasonCode: 'OPS-LATE-INBOUND',
    reasonDescription: 'Inbound aircraft arrived late from previous rotation',
    durationMinutes: 165,
    noticeHours: 1,
    alternativeOffered: false,
  },
  {
    id: 'DIS-011',
    flightId: 'FLT-005',
    type: 'delay',
    reasonCode: 'ATC-DELAY',
    reasonDescription: 'Air traffic control ground delay program at destination',
    durationMinutes: 145,
    noticeHours: 0.75,
    alternativeOffered: false,
  },
  {
    id: 'DIS-012',
    flightId: 'FLT-010',
    type: 'delay',
    reasonCode: 'MX-DEFERRED',
    reasonDescription: 'Deferred maintenance item requiring immediate rectification',
    durationMinutes: 165,
    noticeHours: 2,
    alternativeOffered: false,
  },
  {
    id: 'DIS-013',
    flightId: 'FLT-015',
    type: 'delay',
    reasonCode: 'OPS-CREW-LATE',
    reasonDescription: 'Flight crew delayed by connecting transportation',
    durationMinutes: 155,
    noticeHours: 1.5,
    alternativeOffered: false,
  },
  {
    id: 'DIS-014',
    flightId: 'FLT-017',
    type: 'delay',
    reasonCode: 'WX-DE-ICE',
    reasonDescription: 'Extended de-icing procedure due to freezing precipitation',
    durationMinutes: 205,
    noticeHours: 0.5,
    alternativeOffered: false,
  },
  {
    id: 'DIS-015',
    flightId: 'FLT-019',
    type: 'delay',
    reasonCode: 'OPS-BAGGAGE',
    reasonDescription: 'Delayed baggage loading due to ground equipment failure',
    durationMinutes: 90,
    noticeHours: 0.5,
    alternativeOffered: false,
  },
  {
    id: 'DIS-016',
    flightId: 'FLT-020',
    type: 'delay',
    reasonCode: 'ATC-FLOW',
    reasonDescription: 'Reduced ATC flow rates due to staffing constraints en route',
    durationMinutes: 155,
    noticeHours: 1,
    alternativeOffered: false,
  },
  {
    id: 'DIS-017',
    flightId: 'FLT-022',
    type: 'delay',
    reasonCode: 'MX-AVIONICS',
    reasonDescription: 'Intermittent avionics fault requiring sensor replacement',
    durationMinutes: 120,
    noticeHours: 2,
    alternativeOffered: false,
  },

  // ── Denied Boarding (3) ────────────────────────────────────────────────────
  {
    id: 'DIS-018',
    flightId: 'FLT-002',
    type: 'denied_boarding',
    reasonCode: 'OVB-INVOLUNTARY',
    reasonDescription: 'Involuntary denied boarding due to oversale; no volunteers',
    durationMinutes: 0,
    noticeHours: 0,
    alternativeOffered: true,
  },
  {
    id: 'DIS-019',
    flightId: 'FLT-007',
    type: 'denied_boarding',
    reasonCode: 'OVB-WEIGHT',
    reasonDescription: 'Denied boarding due to aircraft weight and balance restrictions',
    durationMinutes: 0,
    noticeHours: 0,
    alternativeOffered: true,
  },
  {
    id: 'DIS-020',
    flightId: 'FLT-012',
    type: 'denied_boarding',
    reasonCode: 'OVB-DOWNGRADE',
    reasonDescription: 'Denied boarding in booked cabin class due to aircraft swap',
    durationMinutes: 0,
    noticeHours: 0,
    alternativeOffered: true,
  },

  // ── Diversions (2) ─────────────────────────────────────────────────────────
  {
    id: 'DIS-021',
    flightId: 'FLT-008',
    type: 'diversion',
    reasonCode: 'MED-EMERGENCY',
    reasonDescription: 'Diversion to Muscat due to medical emergency on board',
    durationMinutes: 310,
    noticeHours: 0,
    alternativeOffered: true,
  },
  {
    id: 'DIS-022',
    flightId: 'FLT-014',
    type: 'diversion',
    reasonCode: 'WX-DESTINATION',
    reasonDescription: 'Diverted to Osaka Itami due to typhoon closure of Narita',
    durationMinutes: 390,
    noticeHours: 0.5,
    alternativeOffered: true,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Documents — 70 docs for CLM-001 through CLM-035
// ─────────────────────────────────────────────────────────────────────────────

// Helper to build a ClaimDocument concisely
function doc(
  id: string,
  claimId: string,
  fileUrl: string,
  category: ClaimDocument['category'],
  classificationConfidence: number,
  extractedFields: ClaimDocument['extractedFields'],
  validationStatus: ClaimDocument['validationStatus'] = 'validated',
): ClaimDocument {
  return {
    id,
    claimId,
    fileUrl,
    thumbnailUrl: fileUrl.replace('/receipts/', '/thumbnails/').replace('.svg', '-thumb.png'),
    category,
    classificationConfidence,
    extractedFields,
    validationStatus,
  };
}

export const mockDocuments: ClaimDocument[] = [
  // ── CLM-001 (3 docs) ──────────────────────────────────────────────────────
  doc('DOC-001', 'CLM-001', '/receipts/hotel-1.svg', 'hotel', 96, [
    field('Hotel Name', 'Marriott Heathrow', 94),
    field('Check-in Date', '2025-10-05', 97),
    field('Check-out Date', '2025-10-06', 97),
    field('Room Type', 'Standard King', 88),
    field('Amount', '£189.00', 95),
    field('Currency', 'GBP', 99),
    field('Receipt Number', 'MHR-20251005-0842', 91),
  ]),
  doc('DOC-002', 'CLM-001', '/receipts/cab-1.svg', 'cab', 92, [
    field('Vendor', 'Uber', 98),
    field('Pickup', 'Heathrow Terminal 2', 87),
    field('Dropoff', 'Marriott Heathrow Hotel', 85),
    field('Trip Date', '2025-10-05', 96),
    field('Amount', '£12.40', 93),
    field('Currency', 'GBP', 99),
  ]),
  doc('DOC-003', 'CLM-001', '/receipts/food-1.svg', 'food', 89, [
    field('Vendor', 'Heathrow Costa Coffee', 91),
    field('Date', '2025-10-05', 95),
    field('Items', 'Sandwich, Coffee x2', 78),
    field('Amount', '£14.50', 92),
    field('Currency', 'GBP', 99),
  ]),

  // ── CLM-002 (2 docs) ──────────────────────────────────────────────────────
  doc('DOC-004', 'CLM-002', '/receipts/hotel-2.svg', 'hotel', 94, [
    field('Hotel Name', 'JW Marriott Mumbai', 96),
    field('Check-in Date', '2025-10-18', 98),
    field('Check-out Date', '2025-10-19', 98),
    field('Room Type', 'Deluxe Room', 90),
    field('Amount', '₹14,500', 93),
    field('Currency', 'INR', 99),
    field('GST Number', '27AABCJ1234A1ZX', 82),
  ]),
  doc('DOC-005', 'CLM-002', '/receipts/food-2.svg', 'food', 87, [
    field('Vendor', 'Airport Lounge — CSIA T2', 84),
    field('Date', '2025-10-18', 94),
    field('Amount', '₹1,800', 89),
    field('Currency', 'INR', 99),
    field('Voucher Reference', 'LNG-2025-4821', 76),
  ], 'overridden'),

  // ── CLM-003 (3 docs) ──────────────────────────────────────────────────────
  doc('DOC-006', 'CLM-003', '/receipts/hotel-3.svg', 'hotel', 91, [
    field('Hotel Name', 'The Leela Chennai', 93),
    field('Check-in Date', '2025-11-03', 97),
    field('Check-out Date', '2025-11-04', 97),
    field('Amount', '₹9,200', 90),
    field('Currency', 'INR', 99),
  ]),
  doc('DOC-007', 'CLM-003', '/receipts/cab-2.svg', 'cab', 88, [
    field('Vendor', 'Ola Cabs', 95),
    field('Pickup', 'Chennai International Airport', 91),
    field('Dropoff', 'The Leela Chennai', 88),
    field('Trip Date', '2025-11-03', 96),
    field('Amount', '₹650', 90),
    field('Currency', 'INR', 99),
  ]),
  doc('DOC-008', 'CLM-003', '/receipts/food-3.svg', 'food', 83, [
    field('Vendor', 'Saravana Bhavan — Airport', 80),
    field('Date', '2025-11-03', 92),
    field('Amount', '₹420', 85),
    field('Currency', 'INR', 99),
    field('Items', 'Meals x2', 72),
  ]),

  // ── CLM-004 (2 docs) ──────────────────────────────────────────────────────
  doc('DOC-009', 'CLM-004', '/receipts/alternate-carrier-1.svg', 'alternate_carrier', 97, [
    field('Carrier', 'Air India', 98),
    field('Flight Number', 'AI-441', 99),
    field('Origin', 'DEL', 99),
    field('Destination', 'BOM', 99),
    field('Travel Date', '2025-11-14', 99),
    field('Ticket Amount', '₹6,450', 95),
    field('Booking Reference', 'AIBLR8X', 97),
  ]),
  doc('DOC-010', 'CLM-004', '/receipts/food-4.svg', 'food', 78, [
    field('Vendor', 'McDonald\'s — DEL T3', 82),
    field('Date', '2025-11-14', 90),
    field('Amount', '₹540', 80),
    field('Currency', 'INR', 99),
  ], 'overridden'),

  // ── CLM-005 (4 docs) ──────────────────────────────────────────────────────
  doc('DOC-011', 'CLM-005', '/receipts/hotel-4.svg', 'hotel', 95, [
    field('Hotel Name', 'Novotel Hyderabad Airport', 94),
    field('Check-in Date', '2025-11-28', 98),
    field('Check-out Date', '2025-11-29', 97),
    field('Nights', '1', 99),
    field('Amount', '₹7,800', 93),
    field('Currency', 'INR', 99),
  ]),
  doc('DOC-012', 'CLM-005', '/receipts/cab-3.svg', 'cab', 90, [
    field('Vendor', 'Rapido Auto', 93),
    field('Trip Date', '2025-11-28', 95),
    field('Amount', '₹280', 88),
    field('Currency', 'INR', 99),
  ]),
  doc('DOC-013', 'CLM-005', '/receipts/food-5.svg', 'food', 85, [
    field('Vendor', 'Novotel In-Room Dining', 88),
    field('Date', '2025-11-28', 93),
    field('Amount', '₹1,450', 87),
    field('Currency', 'INR', 99),
  ]),
  doc('DOC-014', 'CLM-005', '/receipts/food-6.svg', 'food', 79, [
    field('Vendor', 'HYD Airport Food Court', 77),
    field('Date', '2025-11-29', 91),
    field('Amount', '₹320', 82),
    field('Currency', 'INR', 99),
    field('Items', 'Biryani, Water', 70),
  ], 'overridden'),

  // ── CLM-006 (2 docs) ──────────────────────────────────────────────────────
  doc('DOC-015', 'CLM-006', '/receipts/hotel-5.svg', 'hotel', 93, [
    field('Hotel Name', 'Radisson Blu Kolkata', 92),
    field('Check-in Date', '2025-12-03', 98),
    field('Check-out Date', '2025-12-04', 97),
    field('Amount', '₹8,500', 90),
    field('Currency', 'INR', 99),
  ]),
  doc('DOC-016', 'CLM-006', '/receipts/alternate-carrier-2.svg', 'alternate_carrier', 96, [
    field('Carrier', 'IndiGo', 98),
    field('Flight Number', '6E-391', 99),
    field('Origin', 'CCU', 99),
    field('Destination', 'DEL', 99),
    field('Travel Date', '2025-12-04', 99),
    field('Ticket Amount', '₹4,200', 94),
  ]),

  // ── CLM-007 (3 docs) ──────────────────────────────────────────────────────
  doc('DOC-017', 'CLM-007', '/receipts/hotel-6.svg', 'hotel', 97, [
    field('Hotel Name', 'Rove Dubai Creek', 96),
    field('Check-in Date', '2026-01-07', 98),
    field('Check-out Date', '2026-01-08', 98),
    field('Amount', 'AED 495', 94),
    field('Currency', 'AED', 99),
    field('Room Rate', 'AED 450', 95),
    field('VAT', 'AED 45', 96),
  ]),
  doc('DOC-018', 'CLM-007', '/receipts/cab-4.svg', 'cab', 91, [
    field('Vendor', 'Careem', 96),
    field('Trip Date', '2026-01-07', 97),
    field('Pickup', 'DXB Terminal 3', 90),
    field('Dropoff', 'Rove Hotel Creek', 88),
    field('Amount', 'AED 38', 92),
    field('Currency', 'AED', 99),
  ]),
  doc('DOC-019', 'CLM-007', '/receipts/food-7.svg', 'food', 82, [
    field('Vendor', 'Wafi Gourmet DXB', 80),
    field('Date', '2026-01-07', 94),
    field('Amount', 'AED 120', 84),
    field('Currency', 'AED', 99),
  ]),

  // ── CLM-008 (2 docs) ──────────────────────────────────────────────────────
  doc('DOC-020', 'CLM-008', '/receipts/hotel-7.svg', 'hotel', 94, [
    field('Hotel Name', 'Clayton Hotel Heathrow', 93),
    field('Check-in Date', '2026-01-12', 98),
    field('Check-out Date', '2026-01-13', 97),
    field('Amount', '£210.00', 95),
    field('Currency', 'GBP', 99),
  ]),
  doc('DOC-021', 'CLM-008', '/receipts/food-8.svg', 'food', 86, [
    field('Vendor', 'Upper Crust — LHR T5', 83),
    field('Date', '2026-01-12', 94),
    field('Amount', '£22.80', 88),
    field('Currency', 'GBP', 99),
  ]),

  // ── CLM-009 (3 docs) ──────────────────────────────────────────────────────
  doc('DOC-022', 'CLM-009', '/receipts/alternate-carrier-3.svg', 'alternate_carrier', 98, [
    field('Carrier', 'Emirates', 99),
    field('Flight Number', 'EK-314', 99),
    field('Origin', 'LHR', 99),
    field('Destination', 'DEL', 99),
    field('Travel Date', '2026-01-21', 99),
    field('Ticket Amount', '£685.00', 96),
    field('Booking Reference', 'EKDEL7Q', 97),
    field('Class', 'Economy', 98),
  ]),
  doc('DOC-023', 'CLM-009', '/receipts/hotel-8.svg', 'hotel', 90, [
    field('Hotel Name', 'Sofitel London Gatwick', 89),
    field('Check-in Date', '2026-01-20', 97),
    field('Check-out Date', '2026-01-21', 97),
    field('Amount', '£175.00', 91),
    field('Currency', 'GBP', 99),
  ]),
  doc('DOC-024', 'CLM-009', '/receipts/cab-5.svg', 'cab', 87, [
    field('Vendor', 'National Express', 90),
    field('Route', 'LHR to LGW', 88),
    field('Date', '2026-01-20', 95),
    field('Amount', '£32.00', 89),
    field('Currency', 'GBP', 99),
  ], 'overridden'),

  // ── CLM-010 (2 docs) ──────────────────────────────────────────────────────
  doc('DOC-025', 'CLM-010', '/receipts/hotel-9.svg', 'hotel', 95, [
    field('Hotel Name', 'Oryx Airport Hotel Doha', 96),
    field('Check-in Date', '2026-01-29', 98),
    field('Check-out Date', '2026-01-30', 98),
    field('Amount', 'QAR 680', 93),
    field('Currency', 'QAR', 99),
  ]),
  doc('DOC-026', 'CLM-010', '/receipts/food-9.svg', 'food', 81, [
    field('Vendor', 'Al Mourjan Lounge — DOH', 79),
    field('Date', '2026-01-29', 93),
    field('Amount', 'QAR 95', 83),
    field('Currency', 'QAR', 99),
  ]),

  // ── CLM-011 (3 docs) ──────────────────────────────────────────────────────
  doc('DOC-027', 'CLM-011', '/receipts/hotel-10.svg', 'hotel', 93, [
    field('Hotel Name', 'Grand Hyatt Doha', 94),
    field('Check-in Date', '2026-02-05', 98),
    field('Check-out Date', '2026-02-06', 98),
    field('Nights', '1', 99),
    field('Amount', 'QAR 1,250', 91),
    field('Currency', 'QAR', 99),
  ]),
  doc('DOC-028', 'CLM-011', '/receipts/cab-6.svg', 'cab', 89, [
    field('Vendor', 'Karwa Taxi', 94),
    field('Trip Date', '2026-02-05', 96),
    field('Amount', 'QAR 55', 87),
    field('Currency', 'QAR', 99),
  ]),
  doc('DOC-029', 'CLM-011', '/receipts/food-10.svg', 'food', 84, [
    field('Vendor', 'The Pearl Restaurant — DOH', 82),
    field('Date', '2026-02-05', 92),
    field('Amount', 'QAR 210', 86),
    field('Currency', 'QAR', 99),
    field('Persons', '2', 81),
  ], 'overridden'),

  // ── CLM-012 (2 docs) ──────────────────────────────────────────────────────
  doc('DOC-030', 'CLM-012', '/receipts/hotel-11.svg', 'hotel', 96, [
    field('Hotel Name', 'Park Hyatt Singapore', 97),
    field('Check-in Date', '2026-02-11', 98),
    field('Check-out Date', '2026-02-12', 98),
    field('Amount', 'SGD 320', 95),
    field('Currency', 'SGD', 99),
  ]),
  doc('DOC-031', 'CLM-012', '/receipts/alternate-carrier-4.svg', 'alternate_carrier', 95, [
    field('Carrier', 'Japan Airlines', 98),
    field('Flight Number', 'JL-712', 99),
    field('Origin', 'SIN', 99),
    field('Destination', 'NRT', 99),
    field('Travel Date', '2026-02-12', 99),
    field('Ticket Amount', 'SGD 510', 94),
    field('Booking Reference', 'JLNRT9K', 96),
  ]),

  // ── CLM-013 (4 docs) ──────────────────────────────────────────────────────
  doc('DOC-032', 'CLM-013', '/receipts/hotel-12.svg', 'hotel', 92, [
    field('Hotel Name', 'Swissotel The Stamford', 93),
    field('Check-in Date', '2026-02-20', 98),
    field('Check-out Date', '2026-02-21', 98),
    field('Amount', 'SGD 450', 91),
    field('Currency', 'SGD', 99),
  ]),
  doc('DOC-033', 'CLM-013', '/receipts/cab-7.svg', 'cab', 88, [
    field('Vendor', 'ComfortDelGro Taxi', 93),
    field('Trip Date', '2026-02-20', 96),
    field('Amount', 'SGD 28', 87),
    field('Currency', 'SGD', 99),
    field('Trip Duration', '32 mins', 78),
  ]),
  doc('DOC-034', 'CLM-013', '/receipts/food-11.svg', 'food', 80, [
    field('Vendor', 'Changi Jewel Food Hall', 78),
    field('Date', '2026-02-20', 91),
    field('Amount', 'SGD 35', 82),
    field('Currency', 'SGD', 99),
  ], 'overridden'),
  doc('DOC-035', 'CLM-013', '/receipts/food-12.svg', 'food', 77, [
    field('Vendor', 'Swissotel In-Room Dining', 80),
    field('Date', '2026-02-21', 92),
    field('Amount', 'SGD 68', 79),
    field('Currency', 'SGD', 99),
  ]),

  // ── CLM-014 (2 docs) ──────────────────────────────────────────────────────
  doc('DOC-036', 'CLM-014', '/receipts/hotel-13.svg', 'hotel', 94, [
    field('Hotel Name', 'Hilton Frankfurt Airport', 95),
    field('Check-in Date', '2026-02-27', 98),
    field('Check-out Date', '2026-02-28', 97),
    field('Amount', '€195.00', 93),
    field('Currency', 'EUR', 99),
  ]),
  doc('DOC-037', 'CLM-014', '/receipts/food-13.svg', 'food', 85, [
    field('Vendor', 'Hilton Executive Lounge', 86),
    field('Date', '2026-02-27', 93),
    field('Amount', '€42.50', 87),
    field('Currency', 'EUR', 99),
  ]),

  // ── CLM-015 (3 docs) ──────────────────────────────────────────────────────
  doc('DOC-038', 'CLM-015', '/receipts/hotel-14.svg', 'hotel', 91, [
    field('Hotel Name', 'Lindner Airport Hotel Frankfurt', 90),
    field('Check-in Date', '2026-03-04', 98),
    field('Check-out Date', '2026-03-05', 97),
    field('Amount', '€178.00', 90),
    field('Currency', 'EUR', 99),
    field('Breakfast Included', 'Yes', 88),
  ]),
  doc('DOC-039', 'CLM-015', '/receipts/alternate-carrier-5.svg', 'alternate_carrier', 97, [
    field('Carrier', 'Lufthansa', 99),
    field('Flight Number', 'LH-402', 99),
    field('Origin', 'FRA', 99),
    field('Destination', 'JFK', 99),
    field('Travel Date', '2026-03-05', 99),
    field('Ticket Amount', '€890.00', 96),
    field('Booking Reference', 'LHJFK3M', 97),
  ]),
  doc('DOC-040', 'CLM-015', '/receipts/cab-8.svg', 'cab', 86, [
    field('Vendor', 'Frankfurt Taxi Services', 89),
    field('Trip Date', '2026-03-05', 95),
    field('Amount', '€22.00', 87),
    field('Currency', 'EUR', 99),
  ]),

  // ── CLM-016 (2 docs) ──────────────────────────────────────────────────────
  doc('DOC-041', 'CLM-016', '/receipts/hotel-15.svg', 'hotel', 93, [
    field('Hotel Name', 'ibis Munich Airport', 92),
    field('Check-in Date', '2026-03-09', 98),
    field('Check-out Date', '2026-03-10', 97),
    field('Amount', '€135.00', 91),
    field('Currency', 'EUR', 99),
  ]),
  doc('DOC-042', 'CLM-016', '/receipts/food-14.svg', 'food', 83, [
    field('Vendor', 'MUC Airport Bistro', 81),
    field('Date', '2026-03-09', 93),
    field('Amount', '€28.40', 85),
    field('Currency', 'EUR', 99),
  ], 'overridden'),

  // ── CLM-017 (3 docs) ──────────────────────────────────────────────────────
  doc('DOC-043', 'CLM-017', '/receipts/hotel-16.svg', 'hotel', 95, [
    field('Hotel Name', 'Sheraton JFK Airport Hotel', 95),
    field('Check-in Date', '2026-03-12', 98),
    field('Check-out Date', '2026-03-13', 97),
    field('Amount', '$289.00', 93),
    field('Currency', 'USD', 99),
    field('Room Tax', '$34.68', 91),
  ]),
  doc('DOC-044', 'CLM-017', '/receipts/cab-9.svg', 'cab', 90, [
    field('Vendor', 'Lyft', 97),
    field('Trip Date', '2026-03-12', 96),
    field('Pickup', 'JFK Terminal 8', 92),
    field('Dropoff', 'Sheraton JFK', 90),
    field('Amount', '$22.50', 93),
    field('Currency', 'USD', 99),
  ]),
  doc('DOC-045', 'CLM-017', '/receipts/food-15.svg', 'food', 82, [
    field('Vendor', 'JFK Shake Shack T4', 80),
    field('Date', '2026-03-12', 94),
    field('Amount', '$18.75', 84),
    field('Currency', 'USD', 99),
  ]),

  // ── CLM-018 (2 docs) ──────────────────────────────────────────────────────
  doc('DOC-046', 'CLM-018', '/receipts/hotel-17.svg', 'hotel', 94, [
    field('Hotel Name', 'Hyatt Place Chicago O\'Hare', 93),
    field('Check-in Date', '2026-03-15', 98),
    field('Check-out Date', '2026-03-16', 97),
    field('Amount', '$199.00', 92),
    field('Currency', 'USD', 99),
  ]),
  doc('DOC-047', 'CLM-018', '/receipts/alternate-carrier-6.svg', 'alternate_carrier', 96, [
    field('Carrier', 'United Airlines', 98),
    field('Flight Number', 'UA-779', 99),
    field('Origin', 'ORD', 99),
    field('Destination', 'MIA', 99),
    field('Travel Date', '2026-03-16', 99),
    field('Ticket Amount', '$385.00', 95),
    field('Booking Reference', 'UAMIA6P', 97),
  ]),

  // ── CLM-019 (3 docs) ──────────────────────────────────────────────────────
  doc('DOC-048', 'CLM-019', '/receipts/hotel-18.svg', 'hotel', 92, [
    field('Hotel Name', 'Dallas/Fort Worth Airport Marriott', 91),
    field('Check-in Date', '2026-03-17', 98),
    field('Check-out Date', '2026-03-18', 97),
    field('Amount', '$225.00', 90),
    field('Currency', 'USD', 99),
  ]),
  doc('DOC-049', 'CLM-019', '/receipts/food-16.svg', 'food', 84, [
    field('Vendor', 'DFW Pappadeaux Seafood', 82),
    field('Date', '2026-03-17', 93),
    field('Amount', '$67.20', 86),
    field('Currency', 'USD', 99),
  ]),
  doc('DOC-050', 'CLM-019', '/receipts/cab-10.svg', 'cab', 87, [
    field('Vendor', 'SuperShuttle', 90),
    field('Trip Date', '2026-03-17', 95),
    field('Amount', '$18.00', 88),
    field('Currency', 'USD', 99),
  ], 'overridden'),

  // ── CLM-020 (2 docs) ──────────────────────────────────────────────────────
  doc('DOC-051', 'CLM-020', '/receipts/hotel-19.svg', 'hotel', 95, [
    field('Hotel Name', 'Sheraton Los Angeles', 94),
    field('Check-in Date', '2026-03-19', 98),
    field('Check-out Date', '2026-03-20', 97),
    field('Amount', '$315.00', 93),
    field('Currency', 'USD', 99),
  ]),
  doc('DOC-052', 'CLM-020', '/receipts/food-17.svg', 'food', 80, [
    field('Vendor', 'LAX Tom Bradley Food Court', 78),
    field('Date', '2026-03-19', 91),
    field('Amount', '$24.90', 82),
    field('Currency', 'USD', 99),
  ]),

  // ── CLM-021 (3 docs) ──────────────────────────────────────────────────────
  doc('DOC-053', 'CLM-021', '/receipts/hotel-20.svg', 'hotel', 93, [
    field('Hotel Name', 'Muscat InterContinental', 92),
    field('Check-in Date', '2025-12-22', 98),
    field('Check-out Date', '2025-12-24', 98),
    field('Nights', '2', 99),
    field('Amount', 'OMR 185', 91),
    field('Currency', 'OMR', 99),
  ]),
  doc('DOC-054', 'CLM-021', '/receipts/cab-11.svg', 'cab', 88, [
    field('Vendor', 'Mwasalat Taxi', 90),
    field('Trip Date', '2025-12-22', 96),
    field('Pickup', 'Muscat International Airport', 93),
    field('Amount', 'OMR 12', 87),
    field('Currency', 'OMR', 99),
  ]),
  doc('DOC-055', 'CLM-021', '/receipts/food-18.svg', 'food', 83, [
    field('Vendor', 'Al Angham Restaurant Muscat', 81),
    field('Date', '2025-12-23', 92),
    field('Amount', 'OMR 28', 85),
    field('Currency', 'OMR', 99),
  ]),

  // ── CLM-022 (2 docs) ──────────────────────────────────────────────────────
  doc('DOC-056', 'CLM-022', '/receipts/hotel-21.svg', 'hotel', 96, [
    field('Hotel Name', 'Osaka Itami Airport Hotel', 95),
    field('Check-in Date', '2026-02-11', 98),
    field('Check-out Date', '2026-02-12', 98),
    field('Amount', '¥28,500', 93),
    field('Currency', 'JPY', 99),
  ]),
  doc('DOC-057', 'CLM-022', '/receipts/alternate-carrier-7.svg', 'alternate_carrier', 97, [
    field('Carrier', 'ANA', 99),
    field('Flight Number', 'NH-12', 99),
    field('Origin', 'ITM', 99),
    field('Destination', 'NRT', 99),
    field('Travel Date', '2026-02-12', 99),
    field('Ticket Amount', '¥18,900', 95),
    field('Booking Reference', 'AHANRT5J', 96),
  ]),

  // ── CLM-023 through CLM-035 — remaining 13 docs ──────────────────────────

  // CLM-023 (2 docs)
  doc('DOC-058', 'CLM-023', '/receipts/hotel-22.svg', 'hotel', 91, [
    field('Hotel Name', 'Aloft Mumbai International Airport', 90),
    field('Check-in Date', '2025-10-18', 98),
    field('Check-out Date', '2025-10-19', 97),
    field('Amount', '₹7,200', 89),
    field('Currency', 'INR', 99),
  ]),
  doc('DOC-059', 'CLM-023', '/receipts/food-19.svg', 'food', 79, [
    field('Vendor', 'BOM T2 Food Zone', 77),
    field('Date', '2025-10-18', 90),
    field('Amount', '₹850', 81),
    field('Currency', 'INR', 99),
  ], 'overridden'),

  // CLM-024 (3 docs)
  doc('DOC-060', 'CLM-024', '/receipts/hotel-23.svg', 'hotel', 94, [
    field('Hotel Name', 'Pullman Dubai Creek City Centre', 93),
    field('Check-in Date', '2026-01-07', 98),
    field('Check-out Date', '2026-01-08', 97),
    field('Amount', 'AED 620', 92),
    field('Currency', 'AED', 99),
  ]),
  doc('DOC-061', 'CLM-024', '/receipts/cab-12.svg', 'cab', 87, [
    field('Vendor', 'Dubai Taxi Corporation', 92),
    field('Trip Date', '2026-01-07', 96),
    field('Amount', 'AED 45', 86),
    field('Currency', 'AED', 99),
  ]),
  doc('DOC-062', 'CLM-024', '/receipts/food-20.svg', 'food', 82, [
    field('Vendor', 'Pullman All Day Dining', 80),
    field('Date', '2026-01-07', 93),
    field('Amount', 'AED 165', 84),
    field('Currency', 'AED', 99),
  ]),

  // CLM-025 (2 docs)
  doc('DOC-063', 'CLM-025', '/receipts/hotel-24.svg', 'hotel', 90, [
    field('Hotel Name', 'Premier Inn Heathrow T4', 89),
    field('Check-in Date', '2026-01-12', 98),
    field('Check-out Date', '2026-01-13', 97),
    field('Amount', '£145.00', 88),
    field('Currency', 'GBP', 99),
  ]),
  doc('DOC-064', 'CLM-025', '/receipts/cab-13.svg', 'cab', 85, [
    field('Vendor', 'Heathrow Express', 88),
    field('Date', '2026-01-13', 94),
    field('Route', 'LHR to London Paddington', 90),
    field('Amount', '£37.00', 87),
    field('Currency', 'GBP', 99),
  ]),

  // CLM-026 (3 docs)
  doc('DOC-065', 'CLM-026', '/receipts/hotel-25.svg', 'hotel', 93, [
    field('Hotel Name', 'Movenpick Hotel & Residences Doha', 92),
    field('Check-in Date', '2026-02-05', 98),
    field('Check-out Date', '2026-02-06', 97),
    field('Amount', 'QAR 920', 91),
    field('Currency', 'QAR', 99),
  ]),
  doc('DOC-066', 'CLM-026', '/receipts/alternate-carrier-8.svg', 'alternate_carrier', 95, [
    field('Carrier', 'British Airways', 98),
    field('Flight Number', 'BA-142', 99),
    field('Origin', 'DOH', 99),
    field('Destination', 'LHR', 99),
    field('Travel Date', '2026-02-06', 99),
    field('Ticket Amount', 'QAR 4,200', 94),
    field('Booking Reference', 'BALHR2N', 96),
  ]),
  doc('DOC-067', 'CLM-026', '/receipts/food-21.svg', 'food', 78, [
    field('Vendor', 'Movenpick Café Doha', 76),
    field('Date', '2026-02-05', 91),
    field('Amount', 'QAR 185', 80),
    field('Currency', 'QAR', 99),
  ], 'overridden'),

  // CLM-027 (2 docs)
  doc('DOC-068', 'CLM-027', '/receipts/hotel-26.svg', 'hotel', 92, [
    field('Hotel Name', 'ibis Singapore Airport', 91),
    field('Check-in Date', '2026-02-20', 98),
    field('Check-out Date', '2026-02-21', 97),
    field('Amount', 'SGD 175', 90),
    field('Currency', 'SGD', 99),
  ]),
  doc('DOC-069', 'CLM-027', '/receipts/food-22.svg', 'food', 81, [
    field('Vendor', 'Singapore Changi T1 Food Court', 79),
    field('Date', '2026-02-20', 92),
    field('Amount', 'SGD 18', 83),
    field('Currency', 'SGD', 99),
  ]),

  // CLM-028 through CLM-035 — one final doc to reach exactly 70
  doc('DOC-070', 'CLM-028', '/receipts/hotel-27.svg', 'hotel', 96, [
    field('Hotel Name', 'Frankfurt Marriott Hotel', 95),
    field('Check-in Date', '2026-03-04', 98),
    field('Check-out Date', '2026-03-05', 97),
    field('Amount', '€215.00', 93),
    field('Currency', 'EUR', 99),
    field('Loyalty Points Earned', '3,870', 85),
  ]),
];

// Utility exports for quick lookup
export const flightById = Object.fromEntries(mockFlights.map(f => [f.id, f]));
export const disruptionByFlightId = Object.fromEntries(mockDisruptions.map(d => [d.flightId, d]));
export const documentsByClaimId = mockDocuments.reduce<Record<string, ClaimDocument[]>>((acc, d) => {
  (acc[d.claimId] ??= []).push(d);
  return acc;
}, {});

// Sanity counters (tree-shakeable — not exported)
const _counts = {
  flights: mockFlights.length,           // 22
  disruptions: mockDisruptions.length,   // 22
  documents: mockDocuments.length,       // 70
  cancellations: mockDisruptions.filter(d => d.type === 'cancellation').length,    // 9
  delays: mockDisruptions.filter(d => d.type === 'delay').length,                  // 8
  deniedBoarding: mockDisruptions.filter(d => d.type === 'denied_boarding').length, // 3
  diversions: mockDisruptions.filter(d => d.type === 'diversion').length,           // 2
} as const;
void _counts;
