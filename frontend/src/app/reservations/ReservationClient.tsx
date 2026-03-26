'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { CalendarDays, Clock3, DoorClosed, IndianRupee, Phone, Plus, Search, UserRound } from 'lucide-react';
import { createReservation, markCheckedOutAction } from '../actions/reservation.actions';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const INITIAL_ROOMS = [
  ...Array.from({ length: 7 }, (_, i) => ({
    roomNumber: `10${i + 1}`,
    rate: 1800,
    floor: '1st Floor',
    status: 'vacant',
  })),
  ...Array.from({ length: 11 }, (_, i) => ({
    roomNumber: `2${String(i + 1).padStart(2, '0')}`,
    rate: 2200,
    floor: '2nd Floor',
    status: 'vacant',
  })),
  ...Array.from({ length: 11 }, (_, i) => ({
    roomNumber: `3${String(i + 1).padStart(2, '0')}`,
    rate: 2200,
    floor: '3rd Floor',
    status: 'vacant',
  })),
  ...Array.from({ length: 11 }, (_, i) => ({
    roomNumber: `4${String(i + 1).padStart(2, '0')}`,
    rate: 2500,
    floor: '4th Floor',
    status: 'vacant',
  })),
  ...Array.from({ length: 11 }, (_, i) => ({
    roomNumber: `5${String(i + 1).padStart(2, '0')}`,
    rate: 2500,
    floor: '5th Floor',
    status: 'vacant',
  })),
  ...Array.from({ length: 11 }, (_, i) => ({
    roomNumber: `6${String(i + 1).padStart(2, '0')}`,
    rate: 3000,
    floor: '6th Floor',
    status: 'vacant',
  })),
];

const INITIAL_BROKERS = [
  { id: 'BRK-101', name: 'Broker 101', phone: '9000000001' },
  { id: 'BRK-102', name: 'Broker 102', phone: '9000000002' },
  { id: 'BRK-103', name: 'Broker 103', phone: '9000000003' },
];

const INITIAL_RESERVATIONS = [
  {
    id: 'RSV-1',
    roomNumber: '102',
    guestName: 'Rajesh Kumar',
    rate: 1800,
    amountPaid: 1800,
    paymentMethod: 'cash',
    reservationSource: 'direct',
    brokerId: '',
    checkIn: '2026-03-26T09:30',
    checkOut: '2026-03-27T10:30',
    remarks: 'Walk-in guest',
    status: 'checked_in',
  },
  {
    id: 'RSV-2',
    roomNumber: '104',
    guestName: 'Sowmya R',
    rate: 2200,
    amountPaid: 2200,
    paymentMethod: 'online',
    reservationSource: 'broker',
    brokerId: 'BRK-101',
    checkIn: '2026-03-26T08:00',
    checkOut: '2026-03-26T20:00',
    remarks: 'Corporate short stay',
    status: 'checked_in',
  },
  {
    id: 'RSV-3',
    roomNumber: '203',
    guestName: 'Mahesh Babu',
    rate: 3000,
    amountPaid: 1500,
    paymentMethod: 'online',
    reservationSource: 'broker',
    brokerId: 'BRK-102',
    checkIn: '2026-03-26T11:00',
    checkOut: '2026-03-27T11:00',
    remarks: 'Advance received',
    status: 'checked_in',
  },
];

const defaultForm = {
  roomNumber: '',
  guestName: '',
  rate: '',
  amountPaid: '',
  paymentMethod: 'cash',
  reservationSource: 'direct',
  brokerId: '',
  checkIn: '',
  checkOut: '',
  remarks: '',
  status: 'reserved',
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDateTime(value: string) {
  if (!value) return '—';
  const date = new Date(value);
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

function StatCard({ icon: Icon, label, value, subtext }: { icon: React.ElementType, label: string, value: string, subtext?: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
          {subtext ? <p className="mt-1 text-xs text-slate-500">{subtext}</p> : null}
        </div>
        <div className="rounded-2xl bg-slate-100 p-3">
          <Icon className="h-5 w-5 text-slate-700" />
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string, children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}

export default function ReservationClient({ initialReservations }: { initialReservations: any[] | null }) {
  const [rooms] = useState(INITIAL_ROOMS);
  const [brokers] = useState(INITIAL_BROKERS);
  const [reservations, setReservations] = useState(initialReservations || INITIAL_RESERVATIONS);

  useEffect(() => {
    if (initialReservations) {
      setReservations(initialReservations);
    }
  }, [initialReservations]);

  const [search, setSearch] = useState('');
  const [form, setForm] = useState(defaultForm);

  const isToday = (dateString: string) => {
    if (!dateString) return true;
    const d = new Date(dateString);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  };

  const getMinTimeForCheckIn = () => {
    return isToday(form.checkIn) ? new Date() : new Date(new Date().setHours(0, 0, 0, 0));
  };

  const getMinTimeForCheckOut = () => {
    if (!form.checkIn) return isToday(form.checkOut) ? new Date() : new Date(new Date().setHours(0, 0, 0, 0));
    const inDate = new Date(form.checkIn);
    const outDate = form.checkOut ? new Date(form.checkOut) : inDate;
    return inDate.toDateString() === outDate.toDateString() ? inDate : new Date(new Date().setHours(0, 0, 0, 0));
  };
  
  const endOfDay = new Date(new Date().setHours(23, 59, 59, 999));

  const roomLookup = useMemo(
    () => Object.fromEntries(rooms.map((room) => [room.roomNumber, room])),
    [rooms]
  );

  const occupiedRoomNumbers = useMemo(
    () => new Set(reservations.filter((r) => r.status !== 'checked_out').map((r) => r.roomNumber)),
    [reservations]
  );

  const availableRooms = rooms.filter((room) => !occupiedRoomNumbers.has(room.roomNumber));

  const enrichedReservations = useMemo(() => {
    return reservations
      .map((reservation) => ({
        ...reservation,
        brokerName:
          reservation.brokerId && brokers.find((broker) => broker.id === reservation.brokerId)?.name,
      }))
      .filter((reservation) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return [
          reservation.roomNumber,
          reservation.guestName,
          reservation.paymentMethod,
          reservation.reservationSource,
          reservation.remarks,
          reservation.brokerName || '',
        ]
          .join(' ')
          .toLowerCase()
          .includes(q);
      })
      .sort((a, b) => a.roomNumber.localeCompare(b.roomNumber));
  }, [reservations, brokers, search]);

  const totalCollection = useMemo(
    () => reservations.reduce((sum, item) => sum + Number(item.amountPaid || 0), 0),
    [reservations]
  );

  const brokerCollection = useMemo(
    () => reservations.filter((item) => item.reservationSource === 'broker').reduce((sum, item) => sum + Number(item.amountPaid || 0), 0),
    [reservations]
  );

  const directCollection = useMemo(
    () => reservations.filter((item) => item.reservationSource === 'direct').reduce((sum, item) => sum + Number(item.amountPaid || 0), 0),
    [reservations]
  );

  const handleRoomChange = (roomNumber: string) => {
    setForm((prev) => ({
      ...prev,
      roomNumber,
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.roomNumber || !form.guestName || !form.rate || !form.checkIn || !form.checkOut) {
      alert("Please fill all required fields.");
      return;
    }

    const inDate = new Date(form.checkIn);
    const outDate = new Date(form.checkOut);
    const now = new Date();

    // Prevent past booking checks (with 1 min grace buffer for typing speed)
    if (inDate.getTime() < now.getTime() - 60000) {
      alert("Check-in time cannot be in the past.");
      return;
    }
    if (outDate <= inDate) {
      alert("Check-out time must be after the check-in time.");
      return;
    }

    const newReservation = {
      id: `RSV-${Date.now()}`,
      roomNumber: form.roomNumber,
      guestName: form.guestName,
      rate: Number(form.rate),
      amountPaid: Number(form.amountPaid || 0),
      paymentMethod: form.paymentMethod,
      reservationSource: form.reservationSource,
      brokerId: form.reservationSource === 'broker' ? form.brokerId : '',
      checkIn: form.checkIn,
      checkOut: form.checkOut,
      remarks: form.remarks,
      status: form.status,
    };

    // Optimistic Update
    setReservations((prev) => [newReservation, ...prev]);

    // Background server update
    createReservation(newReservation).catch();

    setForm(defaultForm);
  };

  const markCheckedOut = (id: string) => {
    // Optimistic Update
    setReservations((prev) =>
      prev.map((reservation) =>
        reservation.id === id ? { ...reservation, status: 'checked_out' } : reservation
      )
    );
    
    // Background server update
    markCheckedOutAction(id).catch();
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-[2rem] bg-gradient-to-r from-slate-950 to-slate-800 p-6 text-white shadow-xl md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-300">Hotel Operating System</p>
              <h1 className="mt-3 text-3xl font-semibold md:text-4xl">Room Reservation & Front Desk Register</h1>
              <p className="mt-3 max-w-3xl text-sm text-slate-300 md:text-base">
                This page gives managers a live room log for check-in, check-out, payment collection, room availability,
                and broker-based commission tracking. Later this same data can power website reservations so the room
                inventory always stays up to date.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-slate-300">Total Rooms</p>
                <p className="mt-2 text-2xl font-semibold">{rooms.length}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-slate-300">Available</p>
                <p className="mt-2 text-2xl font-semibold">{availableRooms.length}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-slate-300">Occupied</p>
                <p className="mt-2 text-2xl font-semibold">{rooms.length - availableRooms.length}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-slate-300">Today Collection</p>
                <p className="mt-2 text-xl font-semibold">{formatCurrency(totalCollection)}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={IndianRupee} label="Total Collection" value={formatCurrency(totalCollection)} subtext="Cash + online received" />
          <StatCard icon={DoorClosed} label="Available Rooms" value={String(availableRooms.length)} subtext="Live room inventory" />
          <StatCard icon={UserRound} label="Direct Reservation Collection" value={formatCurrency(directCollection)} subtext="No commission involved" />
          <StatCard icon={Phone} label="Broker Reservation Collection" value={formatCurrency(brokerCollection)} subtext="Commission-based bookings" />
        </section>

        <section className="grid gap-8 xl:grid-cols-[420px_minmax(0,1fr)]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-slate-100 p-3">
                <Plus className="h-5 w-5 text-slate-700" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">New Reservation Entry</h2>
                <p className="text-sm text-slate-500">Used by manager/front desk for walk-in and broker bookings</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <Field label="Room Number">
                <select
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-500"
                  value={form.roomNumber}
                  onChange={(e) => handleRoomChange(e.target.value)}
                >
                  <option value="">Select available room</option>
                  {availableRooms.map((room) => (
                    <option key={room.roomNumber} value={room.roomNumber}>
                      {room.roomNumber} · {room.floor}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Guest Name">
                <input
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-500"
                  value={form.guestName}
                  onChange={(e) => setForm((prev) => ({ ...prev, guestName: e.target.value }))}
                  placeholder="Enter guest name"
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Room Rate">
                  <input
                    type="number"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-500"
                    value={form.rate}
                    onChange={(e) => setForm((prev) => ({ ...prev, rate: e.target.value }))}
                    placeholder="Rate"
                  />
                </Field>
                <Field label="Amount Paid">
                  <input
                    type="number"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-500"
                    value={form.amountPaid}
                    onChange={(e) => setForm((prev) => ({ ...prev, amountPaid: e.target.value }))}
                    placeholder="Received"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Payment Mode">
                  <select
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-500"
                    value={form.paymentMethod}
                    onChange={(e) => setForm((prev) => ({ ...prev, paymentMethod: e.target.value }))}
                  >
                    <option value="cash">Cash</option>
                    <option value="online">Online</option>
                  </select>
                </Field>
                <Field label="Reservation Type">
                  <select
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-500"
                    value={form.reservationSource}
                    onChange={(e) => setForm((prev) => ({ ...prev, reservationSource: e.target.value, brokerId: '' }))}
                  >
                    <option value="direct">Direct</option>
                    <option value="broker">Broker</option>
                  </select>
                </Field>
              </div>

              {form.reservationSource === 'broker' ? (
                <Field label="Broker Number / ID">
                  <select
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-500"
                    value={form.brokerId}
                    onChange={(e) => setForm((prev) => ({ ...prev, brokerId: e.target.value }))}
                  >
                    <option value="">Select broker</option>
                    {brokers.map((broker) => (
                      <option key={broker.id} value={broker.id}>
                        {broker.id} · {broker.name}
                      </option>
                    ))}
                  </select>
                </Field>
              ) : null}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Check-in Time">
                  <DatePicker
                    selected={form.checkIn ? new Date(form.checkIn) : null}
                    onChange={(date: Date | null) => {
                      if (date) {
                        setForm((prev) => ({ ...prev, checkIn: date.toISOString(), status: 'checked_in' }));
                      }
                    }}
                    showTimeSelect
                    timeFormat="h:mm aa"
                    timeIntervals={15}
                    dateFormat="MMM d, yyyy h:mm aa"
                    minDate={new Date()}
                    minTime={getMinTimeForCheckIn()}
                    maxTime={endOfDay}
                    wrapperClassName="w-full"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-500"
                    placeholderText="Select check-in"
                  />
                </Field>
                <Field label="Check-out Time">
                  <DatePicker
                    selected={form.checkOut ? new Date(form.checkOut) : null}
                    onChange={(date: Date | null) => {
                      if (date) {
                        setForm((prev) => ({ ...prev, checkOut: date.toISOString() }));
                      }
                    }}
                    showTimeSelect
                    timeFormat="h:mm aa"
                    timeIntervals={15}
                    dateFormat="MMM d, yyyy h:mm aa"
                    minDate={form.checkIn ? new Date(form.checkIn) : new Date()}
                    minTime={getMinTimeForCheckOut()}
                    maxTime={endOfDay}
                    wrapperClassName="w-full"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-500"
                    placeholderText="Select check-out"
                  />
                </Field>
              </div>

              <Field label="Remarks">
                <textarea
                  className="min-h-[96px] w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-500"
                  value={form.remarks}
                  onChange={(e) => setForm((prev) => ({ ...prev, remarks: e.target.value }))}
                  placeholder="Advance paid, late check-out, corporate booking, extra bed, etc."
                />
              </Field>

              <button
                type="submit"
                className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Save Reservation Entry
              </button>
            </form>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Live Front Desk Register</h2>
                  <p className="text-sm text-slate-500">All current room usage, payment mode, and source tracking in one place</p>
                </div>
                <div className="relative w-full md:max-w-xs">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search room, guest, broker..."
                    className="w-full rounded-2xl border border-slate-200 py-3 pl-11 pr-4 text-sm outline-none focus:border-slate-500"
                  />
                </div>
              </div>

              <div className="mt-6 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="px-3 py-3 font-medium">Room</th>
                      <th className="px-3 py-3 font-medium">Guest</th>
                      <th className="px-3 py-3 font-medium">Rate</th>
                      <th className="px-3 py-3 font-medium">Paid</th>
                      <th className="px-3 py-3 font-medium">Mode</th>
                      <th className="px-3 py-3 font-medium">Type</th>
                      <th className="px-3 py-3 font-medium">Check-in</th>
                      <th className="px-3 py-3 font-medium">Check-out</th>
                      <th className="px-3 py-3 font-medium">Remarks</th>
                      <th className="px-3 py-3 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrichedReservations.map((reservation) => (
                      <tr key={reservation.id} className="border-b border-slate-100 align-top">
                        <td className="px-3 py-4 font-semibold text-slate-900">{reservation.roomNumber}</td>
                        <td className="px-3 py-4">
                          <div className="font-medium text-slate-900">{reservation.guestName}</div>
                          {reservation.brokerName ? (
                            <div className="mt-1 text-xs text-slate-500">Broker: {reservation.brokerName}</div>
                          ) : null}
                        </td>
                        <td className="px-3 py-4">{formatCurrency(reservation.rate)}</td>
                        <td className="px-3 py-4">{formatCurrency(reservation.amountPaid)}</td>
                        <td className="px-3 py-4">
                          <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium capitalize text-slate-700">
                            {reservation.paymentMethod}
                          </span>
                        </td>
                        <td className="px-3 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                              reservation.reservationSource === 'broker'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {reservation.reservationSource === 'broker' ? 'Commission' : 'Direct'}
                          </span>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap">{formatDateTime(reservation.checkIn)}</td>
                        <td className="px-3 py-4 whitespace-nowrap">{formatDateTime(reservation.checkOut)}</td>
                        <td className="px-3 py-4 text-slate-600">{reservation.remarks || '—'}</td>
                        <td className="px-3 py-4">
                          {reservation.status !== 'checked_out' ? (
                            <button
                              type="button"
                              onClick={() => markCheckedOut(reservation.id)}
                              className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                            >
                              Mark Check-out
                            </button>
                          ) : (
                            <span className="text-xs font-medium text-slate-400">Closed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <CalendarDays className="h-5 w-5 text-slate-700" />
                  <h3 className="text-lg font-semibold text-slate-900">Available Rooms Snapshot</h3>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {rooms.map((room) => {
                    const isAvailable = !occupiedRoomNumbers.has(room.roomNumber);
                    return (
                      <div
                        key={room.roomNumber}
                        className={`rounded-2xl border p-4 ${
                          isAvailable
                            ? 'border-emerald-200 bg-emerald-50'
                            : 'border-rose-200 bg-rose-50'
                        }`}
                      >
                        <div className="text-sm font-semibold text-slate-900">Room {room.roomNumber}</div>
                        <div className={`mt-1 text-xs font-medium ${isAvailable ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {isAvailable ? 'Available' : 'Occupied'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

               <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <Clock3 className="h-5 w-5 text-slate-700" />
                  <h3 className="text-lg font-semibold text-slate-900">Broker Commission Visibility</h3>
                </div>
                <div className="mt-4 space-y-3">
                  {brokers.map((broker) => {
                    const linked = reservations.filter((r) => r.brokerId === broker.id && r.status !== 'checked_out');
                    const amount = linked.reduce((sum, item) => sum + item.amountPaid, 0);
                    return (
                      <div key={broker.id} className="rounded-2xl border border-slate-200 p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="font-semibold text-slate-900">{broker.name}</div>
                            <div className="mt-1 text-xs text-slate-500">Assigned code: {broker.id}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold text-slate-900">{linked.length} booking(s)</div>
                            <div className="mt-1 text-xs text-slate-500">Collection: {formatCurrency(amount)}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
