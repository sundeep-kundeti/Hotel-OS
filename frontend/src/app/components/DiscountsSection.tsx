'use client';
import React from 'react';
import { Percent, Users, Briefcase, GraduationCap, Shield, Cross, Scale, Heart } from 'lucide-react';

const discountCards = [
  {
    icon: Shield,
    title: 'Police Personnel',
    description: 'Special discount for police officers and their families',
    color: 'blue',
    borderColor: 'border-blue-500',
    bgColor: 'bg-blue-100',
    iconColor: 'text-blue-600',
    textColor: 'text-blue-600',
  },
  {
    icon: Cross,
    title: 'Medical Staff',
    description: 'Discount for doctors, nurses, and healthcare workers',
    color: 'red',
    borderColor: 'border-red-500',
    bgColor: 'bg-red-100',
    iconColor: 'text-red-600',
    textColor: 'text-red-600',
  },
  {
    icon: Heart,
    title: 'Armed Forces',
    description: 'Special rates for Army, Navy, and Air Force personnel',
    color: 'green',
    borderColor: 'border-green-500',
    bgColor: 'bg-green-100',
    iconColor: 'text-green-600',
    textColor: 'text-green-600',
  },
  {
    icon: Scale,
    title: 'Legal Professionals',
    description: 'Discount for lawyers, judges, and legal staff',
    color: 'purple',
    borderColor: 'border-purple-500',
    bgColor: 'bg-purple-100',
    iconColor: 'text-purple-600',
    textColor: 'text-purple-600',
  },
];

const bigCards = [
  {
    icon: Users,
    title: 'Group Bookings',
    description: 'Special discounted rates for group bookings. Perfect for families, friends, or tour groups.',
    note: 'Contact us for bulk booking rates',
    gradient: 'from-amber-500 to-amber-600',
    lightText: 'text-amber-100',
  },
  {
    icon: Briefcase,
    title: 'Corporate Discount',
    description: 'Exclusive corporate rates for business travelers and company bookings.',
    note: 'MOU available for regular bookings',
    gradient: 'from-blue-500 to-blue-600',
    lightText: 'text-blue-100',
  },
  {
    icon: GraduationCap,
    title: 'Student Discount',
    description: 'Special rates for students with valid ID. Educational tours welcome.',
    note: 'Valid student ID required',
    gradient: 'from-emerald-500 to-emerald-600',
    lightText: 'text-emerald-100',
  },
];

export default function DiscountsSection() {
  return (
    <div id="discounts" className="bg-gradient-to-b from-slate-50 to-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-2 rounded-full mb-5 shadow-sm">
            <Percent className="w-4 h-4" />
            <span className="font-bold text-sm">Special Discounts Available</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
            Exclusive Offers
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg font-medium">
            We value your service and dedication. Enjoy special discounts on your stay.
          </p>
        </div>

        {/* Professional Discount Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
          {discountCards.map((card) => (
            <div
              key={card.title}
              className={`bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border-l-4 ${card.borderColor} hover:-translate-y-1 group`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`${card.bgColor} p-3 rounded-xl transition-transform group-hover:scale-110`}>
                  <card.icon className={`w-5 h-5 ${card.iconColor}`} />
                </div>
                <h3 className="text-base font-bold text-slate-900">{card.title}</h3>
              </div>
              <p className="text-slate-500 text-sm mb-3 leading-relaxed">{card.description}</p>
              <p className={`${card.textColor} font-bold text-sm`}>Exclusive Rates</p>
            </div>
          ))}
        </div>

        {/* Big Category Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {bigCards.map((card) => (
            <div
              key={card.title}
              className={`bg-gradient-to-br ${card.gradient} text-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group`}
            >
              <card.icon className="w-10 h-10 mb-5 transition-transform group-hover:scale-110" />
              <h3 className="text-xl font-bold mb-3">{card.title}</h3>
              <p className={`${card.lightText} mb-4 leading-relaxed`}>{card.description}</p>
              <p className="text-sm font-medium opacity-80">{card.note}</p>
            </div>
          ))}
        </div>

        {/* Note & CTA */}
        <div className="text-center bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-slate-600 mb-5 max-w-xl mx-auto">
            <strong>Note:</strong> Valid government ID or proof of eligibility required at check-in for discount claims.
            Discounts cannot be combined with other offers.
          </p>
          <a
            href="tel:+917416686677"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-md shadow-amber-200/50 hover:shadow-lg hover:-translate-y-0.5"
          >
            Call for Discount Rates
          </a>
        </div>
      </div>
    </div>
  );
}
