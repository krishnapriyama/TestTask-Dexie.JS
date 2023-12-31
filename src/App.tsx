import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardActions, Button, CircularProgress } from '@mui/material';
import Dexie from 'dexie';
import './App.css';

const db = new Dexie('UserDataDB');
db.version(1).stores({ users: '++id, name, picture' });

interface User {
  id: number;
  name: string;
  picture: string;
}

const App: React.FC = () => {
  const [allUsers, setAllUsers] = useState<User[]>([]); // All fetched users
  const [displayedUsers, setDisplayedUsers] = useState<User[]>([]); // Users displayed in the UI
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRandomUsers();
  }, []);

  useEffect(() => {
    const storedDisplayedUsers = JSON.parse(localStorage.getItem('displayedUsers') || '[]');
    setDisplayedUsers(storedDisplayedUsers);
  }, []);

  useEffect(() => {
    localStorage.setItem('displayedUsers', JSON.stringify(displayedUsers));
  }, [displayedUsers]);

  const fetchRandomUsers = async () => {
    try {
      const response = await fetch('https://randomuser.me/api/?results=50');
      const data = await response.json();
      const userData: User[] = data.results.map((user: any) => ({
        name: `${user.name.first} ${user.name.last}`,
        picture: user.picture.large,
        id: user.login.uuid,
      }));
      await db.users.bulkPut(userData);
      const storedUsers = await db.users.toArray();
      setAllUsers(storedUsers);
      setDisplayedUsers(storedUsers);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleDelete = async (userId: number) => {
    await db.users.delete(userId);
    const updatedDisplayedUsers = displayedUsers.filter(user => user.id !== userId);
    setDisplayedUsers(updatedDisplayedUsers);
  };

  const handleRefresh = async () => {
    setLoading(true);
    await fetchRandomUsers();
  };

  return (
    <div className="app-container">
      {loading ? (
        <div className="spinner-container">
          <CircularProgress />
        </div>
      ) : (
        <div>
          <div className='top'>
            <Button className="refresh-button" variant="outlined" onClick={handleRefresh}>
              Refresh
            </Button>
            <div className="total-count">Total: {displayedUsers.length}</div>
          </div>

          <div className="card-list">
            {displayedUsers.map((user) => (
              <Card key={user.id} className="user-card">
                <CardContent>
                  <img src={user.picture} alt="User" className="user-picture" />
                  <div className="user-name">{user.name}</div>
                </CardContent>
                <CardActions>
                  <Button
                    variant="outlined"
                    className="delete-button"
                    onClick={() => handleDelete(user.id)}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
