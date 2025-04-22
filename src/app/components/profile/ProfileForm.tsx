'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Climber } from '@prisma/client';

type UserWithClimber = User & {
  climber: Climber | null;
};

export default function ProfileForm({ user }: { user: UserWithClimber | null }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          age: formData.age ? parseInt(formData.age) : null,
          height: formData.height ? parseInt(formData.height) : null,
          span: formData.span ? parseInt(formData.span) : null,
        }),
      });

      if (!response.ok) {
        const errMsg = await response.json();
        throw new Error(errMsg.message || 'Failed to update profile');
      }

      router.push('/profile');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-control space-y-4 w-full">
      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      <label className="label label-text text-gray-700">Climbing Nickname/Alias</label>
      <input
        type="text"
        name="alias"
        value={formData.alias}
        onChange={handleChange}
        className="input input-bordered w-full"
      />

      <label className="label label-text text-gray-700">Age</label>
      <input
        type="number"
        name="age"
        min="0"
        max="120"
        step="1"
        value={formData.age}
        onChange={handleChange}
        className="input input-bordered w-full"
      />

      <label className="label label-text text-gray-700">Gender</label>
      <select
        name="gender"
        value={formData.gender}
        onChange={handleChange}
        className="select select-bordered w-full"
      >
        <option value="">Select</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
        <option value="non-binary">Non-binary</option>
        <option value="other">Other</option>
        <option value="prefer-not-to-say">Prefer not to say</option>
      </select>

      <label className="label label-text text-gray-700">Height (cm)</label>
      <input
        type="number"
        name="height"
        min="100"
        max="250"
        step="1"
        value={formData.height}
        onChange={handleChange}
        className="input input-bordered w-full"
      />

      <label className="label label-text text-gray-700">Arm Span (cm)</label>
      <input
        type="number"
        name="span"
        min="100"
        max="250"
        step="1"
        value={formData.span}
        onChange={handleChange}
        className="input input-bordered w-full"
      />

      <label className="label label-text text-gray-700">Route Grade</label>
      <input
        type="text"
        name="routeGrade"
        value={formData.routeGrade}
        onChange={handleChange}
        className="input input-bordered w-full"
      />

      <label className="label label-text text-gray-700">Boulder Grade</label>
      <input
        type="text"
        name="boulderGrade"
        value={formData.boulderGrade}
        onChange={handleChange}
        className="input input-bordered w-full"
      />

      <div className="flex justify-end space-x-3 pt-4">
        <button type="button" onClick={() => router.push('/profile')} className="btn btn-ghost">
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting} className="btn btn-primary">
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
