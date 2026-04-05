import React from 'react';

export const PageHeader: React.FC = () => {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-indigo-800 mb-3">
        Fresh Up Rooms
      </h1>
      <p className="text-slate-500 max-w-2xl text-sm md:text-base leading-relaxed">
        Book an hourly fresh-up room natively. Simply select your date, time, and duration to see live availability. Rooms are strictly for wash & change purposes. T&C Apply.
      </p>
    </div>
  );
};
