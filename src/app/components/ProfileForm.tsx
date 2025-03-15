'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Climber } from '@prisma/client';
import Link from 'next/link';

type UserWithClimber = User & {
  climber: Climber | null;
};

export default function ProfileForm({ user }: { user: UserWithClimber | null }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form state with existing data or defaults
  const [formData, setFormData] = useState({
    alias: user?.climber?.alias || '',
    age: user?.climber?.age?.toString() || '',
    gender: user?.climber?.gender || '',
    height: user?.climber?.height?.toString() || '',
    span: user?.climber?.span?.toString() || '',
    routeGrade: user?.climber?.routeGrade || '',
    boulderGrade: user?.climber?.boulderGrade || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          age: formData.age ? parseInt(formData.age) : null,
          height: formData.height ? parseFloat(formData.height) : null,
          span: formData.span ? parseFloat(formData.span) : null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update profile');
      }

      router.push('/profile');
      router.refresh(); // Refresh the page data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-900/50 border border-red-500 text-white p-3 rounded-md">{error}</div>
      )}

      <div>
        <label htmlFor="alias" className="block text-sm font-medium text-gray-300 mb-1">
          Climbing Nickname/Alias
        </label>
        <input
          type="text"
          id="alias"
          name="alias"
          value={formData.alias}
          onChange={handleChange}
          className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="age" className="block text-sm font-medium text-gray-300 mb-1">
            Age
          </label>
          <input
            type="number"
            id="age"
            name="age"
            value={formData.age}
            onChange={handleChange}
            min="0"
            max="120"
            className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="gender" className="block text-sm font-medium text-gray-300 mb-1">
            Gender
          </label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="non-binary">Non-binary</option>
            <option value="other">Other</option>
            <option value="prefer-not-to-say">Prefer not to say</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="height" className="block text-sm font-medium text-gray-300 mb-1">
            Height (cm)
          </label>
          <input
            type="number"
            id="height"
            name="height"
            value={formData.height}
            onChange={handleChange}
            step="0.1"
            min="0"
            className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="span" className="block text-sm font-medium text-gray-300 mb-1">
            Arm Span (cm)
          </label>
          <input
            type="number"
            id="span"
            name="span"
            value={formData.span}
            onChange={handleChange}
            step="0.1"
            min="0"
            className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="pt-4 border-t border-slate-700">
        <h3 className="text-md font-medium mb-3 text-blue-400">Climbing Grades</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="routeGrade" className="block text-sm font-medium text-gray-300 mb-1">
              Route Grade
            </label>
            <input
              type="text"
              id="routeGrade"
              name="routeGrade"
              value={formData.routeGrade}
              onChange={handleChange}
              placeholder="e.g. 5.10c, 7a"
              className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="boulderGrade" className="block text-sm font-medium text-gray-300 mb-1">
              Boulder Grade
            </label>
            <input
              type="text"
              id="boulderGrade"
              name="boulderGrade"
              value={formData.boulderGrade}
              onChange={handleChange}
              placeholder="e.g. V5, 6B+"
              className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Link
          href="/profile"
          className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-md text-white transition-colors"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-md text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
