
import React, { useState, useEffect } from 'react';
import { User, Order } from '../types';
import { apiService } from '../services/apiService';

interface ProfilePageProps {
  currentUser: User;
  setCurrentUser: (user: User | null) => void;
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ currentUser, setCurrentUser, setUsers }) => {
  const [name, setName] = useState(currentUser.name);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setName(currentUser.name);
  }, [currentUser]);

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiService.updateUser(currentUser.id, { name, email: currentUser.email });
      const updatedUser = { ...currentUser, name };
      setCurrentUser(updatedUser);
      setUsers(prevUsers => prevUsers.map(u => u.id === currentUser.id ? updatedUser : u));
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update name:', error);
      alert('Failed to update name. Please try again.');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUsers([]);
    apiService.clearToken();
    window.location.href = '/';
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>

      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Personal Information</h2>
        {!isEditing ? (
            <div className="flex justify-between items-center">
                <div>
                    <p><strong>Name:</strong> {currentUser.name}</p>
                    <p><strong>Email:</strong> {currentUser.email}</p>
                    {currentUser.studentId && <p><strong>Student ID:</strong> {currentUser.studentId}</p>}
                </div>
                <button onClick={() => setIsEditing(true)} className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg">Edit Name</button>
            </div>
        ) : (
            <form onSubmit={handleUpdateName} className="space-y-4">
                <div>
                    <label htmlFor="profileName" className="block text-sm font-medium text-gray-700">Name</label>
                    <input type="text" id="profileName" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                </div>
                <div className="flex gap-4">
                    <button type="submit" className="bg-primary text-white font-semibold py-2 px-4 rounded-lg hover:bg-primary-dark">Save Changes</button>
                    <button type="button" onClick={() => {setIsEditing(false); setName(currentUser.name);}} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg">Cancel</button>
                </div>
            </form>
        )}
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Account Actions</h2>
        <button onClick={handleLogout} className="bg-red-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors">
          Logout
        </button>
      </div>

    </div>
  );
};

export default ProfilePage;
