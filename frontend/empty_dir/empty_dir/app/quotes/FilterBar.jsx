"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function FilterBar({ zip: initialZip = '' }) {
  const router = useRouter();
  const sp = useSearchParams();

  const [multipleVehicles, setMultipleVehicles] = useState(sp.get('mv') || 'Yes');
  const [age, setAge] = useState(sp.get('age') || '25-34');
  const [insured, setInsured] = useState(sp.get('insured') || 'Yes');
  const [married, setMarried] = useState(sp.get('married') || 'Married');
  const [homeowner, setHomeowner] = useState(sp.get('homeowner') || 'Yes');
  const [credit, setCredit] = useState(sp.get('credit') || 'Good');
  const [accidents, setAccidents] = useState(sp.get('acc') || 'No');
  const [zip, setZip] = useState(initialZip);

  useEffect(() => {
    // Keep local ZIP in sync if search params change elsewhere
    const spZip = sp.get('zip') || '';
    if (spZip && spZip !== zip) setZip(spZip);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp]);

  function onUpdate() {
    const qs = new URLSearchParams();
    if (zip) qs.set('zip', zip.slice(0, 5));
    qs.set('mv', multipleVehicles);
    qs.set('age', age);
    qs.set('insured', insured);
    qs.set('married', married);
    qs.set('homeowner', homeowner);
    qs.set('credit', credit);
    qs.set('acc', accidents);
    router.push(`/quotes?${qs.toString()}`);
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-3 sm:gap-4">
        <div className="flex flex-col">
          <label className="text-[11px] font-medium text-gray-600">Multiple Vehicles</label>
          <select className="mt-1 w-full h-10 rounded-lg border-gray-300 bg-gray-50 px-2 text-sm focus:ring-2 focus:ring-orange-300 focus:border-orange-300" value={multipleVehicles} onChange={(e) => setMultipleVehicles(e.target.value)}>
            <option>Yes</option>
            <option>No</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-[11px] font-medium text-gray-600">Age</label>
          <select className="mt-1 w-full h-10 rounded-lg border-gray-300 bg-gray-50 px-2 text-sm focus:ring-2 focus:ring-orange-300 focus:border-orange-300" value={age} onChange={(e) => setAge(e.target.value)}>
            <option>18-24</option>
            <option>25-34</option>
            <option>35-44</option>
            <option>45-54</option>
            <option>55-64</option>
            <option>65+</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-[11px] font-medium text-gray-600">Currently Insured?</label>
          <select className="mt-1 w-full h-10 rounded-lg border-gray-300 bg-gray-50 px-2 text-sm focus:ring-2 focus:ring-orange-300 focus:border-orange-300" value={insured} onChange={(e) => setInsured(e.target.value)}>
            <option>Yes</option>
            <option>No</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-[11px] font-medium text-gray-600">Married?</label>
          <select className="mt-1 w-full h-10 rounded-lg border-gray-300 bg-gray-50 px-2 text-sm focus:ring-2 focus:ring-orange-300 focus:border-orange-300" value={married} onChange={(e) => setMarried(e.target.value)}>
            <option>Married</option>
            <option>Single</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-[11px] font-medium text-gray-600">Homeowner?</label>
          <select className="mt-1 w-full h-10 rounded-lg border-gray-300 bg-gray-50 px-2 text-sm focus:ring-2 focus:ring-orange-300 focus:border-orange-300" value={homeowner} onChange={(e) => setHomeowner(e.target.value)}>
            <option>Yes</option>
            <option>No</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-[11px] font-medium text-gray-600">Credit?</label>
          <select className="mt-1 w-full h-10 rounded-lg border-gray-300 bg-gray-50 px-2 text-sm focus:ring-2 focus:ring-orange-300 focus:border-orange-300" value={credit} onChange={(e) => setCredit(e.target.value)}>
            <option>Poor</option>
            <option>Fair</option>
            <option>Good</option>
            <option>Excellent</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-[11px] font-medium text-gray-600">Accidents?</label>
          <select className="mt-1 w-full h-10 rounded-lg border-gray-300 bg-gray-50 px-2 text-sm focus:ring-2 focus:ring-orange-300 focus:border-orange-300" value={accidents} onChange={(e) => setAccidents(e.target.value)}>
            <option>No</option>
            <option>Yes</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-[11px] font-medium text-gray-600">Zip Code*</label>
          <div className="mt-1 flex flex-col sm:flex-row gap-2">
            <input
              value={zip}
              onChange={(e) => setZip(e.target.value.replace(/[^0-9]/g, '').slice(0, 5))}
              className="w-full h-10 rounded-lg border-gray-300 bg-gray-50 px-2 text-sm focus:ring-2 focus:ring-orange-300 focus:border-orange-300"
              placeholder="30001"
              inputMode="numeric"
              maxLength={5}
            />
            <button type="button" onClick={onUpdate} className="h-10 rounded-lg bg-orange-600 hover:bg-orange-700 text-white px-4 font-semibold w-full sm:w-auto">
              Update
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}