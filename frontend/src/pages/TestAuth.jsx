import React, { useState, useEffect } from 'react';

const API_BASE_URL = "http://localhost:8000";

export default function TestAuth() {
  const [users, setUsers] = useState([]);
  const [email, setEmail] = useState('test@volo.africa');
  const [password, setPassword] = useState('Test@123');
  const [testResult, setTestResult] = useState(null);
  const [loginResult, setLoginResult] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/list-users/`);
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const testLogin = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/test-login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      setTestResult(data);
    } catch (error) {
      setTestResult({ error: error.message });
    }
  };

  const actualLogin = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/token/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      setLoginResult({ success: response.ok, data });
    } catch (error) {
      setLoginResult({ success: false, error: error.message });
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Authentication Debug</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Users List */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Users in Database ({users.length})</h2>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {users.map(user => (
              <div key={user.id} className="p-2 border rounded text-sm">
                <div><strong>Email:</strong> {user.email}</div>
                <div><strong>Username:</strong> {user.username}</div>
                <div><strong>Name:</strong> {user.first_name} {user.last_name}</div>
                <div><strong>Active:</strong> {user.is_active ? 'Yes' : 'No'}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Test Form */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Test Authentication</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div className="space-y-2">
              <button
                onClick={testLogin}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                Test Login (Debug)
              </button>
              <button
                onClick={actualLogin}
                className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
              >
                Actual Login (JWT)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {testResult && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Debug Test Result</h3>
            <pre className="text-sm overflow-auto">{JSON.stringify(testResult, null, 2)}</pre>
          </div>
        )}
        
        {loginResult && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">JWT Login Result</h3>
            <pre className="text-sm overflow-auto">{JSON.stringify(loginResult, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}