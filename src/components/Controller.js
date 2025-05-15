import React, { useState, useEffect, useCallback } from 'react';
import pb from '../pocketbase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPlus, faTrash, faVolumeUp, faStop } from '@fortawesome/free-solid-svg-icons';

function Controller() {
  const [stations, setStations] = useState([]);
  const [newStation, setNewStation] = useState({ name: '', streamUrl: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolume] = useState(1);
  const [volumeTimeout, setVolumeTimeout] = useState(null);

  useEffect(() => {
    let unsubscribe = null;
    let abortController = new AbortController();

    const setupSubscription = async () => {
      try {
        // Get initial stations
        const records = await pb.collection('stations').getList(1, 50, {
          signal: abortController.signal
        });
        setStations(records.items);

        // Get initial volume from currently playing station
        const currentPlayingStation = records.items.find(station => station.isPlaying);
        if (currentPlayingStation?.volume !== undefined) {
          setVolume(currentPlayingStation.volume);
        }

        // Subscribe to real-time updates
        unsubscribe = await pb.collection('stations').subscribe('*', function(e) {
          if (e.action === 'create' || e.action === 'update' || e.action === 'delete') {
            fetchStations();
          }
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error in setup:', error);
        }
      }
    };

    setupSubscription();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
      abortController.abort();
    };
  }, []);

  const fetchStations = async () => {
    try {
      const records = await pb.collection('stations').getList(1, 50);
      setStations(records.items);
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error fetching stations:', error);
      }
    }
  };

  const handleAddStation = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await pb.collection('stations').create({
        name: newStation.name,
        streamUrl: newStation.streamUrl,
        isPlaying: false,
        volume: volume // Set initial volume for new station
      });
      setNewStation({ name: '', streamUrl: '' });
      await fetchStations();
    } catch (error) {
      console.error('Error adding station:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayStation = async (stationId) => {
    try {
      setIsLoading(true);
      // Set all stations to not playing
      await Promise.all(stations.map(station => 
        pb.collection('stations').update(station.id, { isPlaying: false })
      ));
      
      // Set selected station to playing with current volume
      await pb.collection('stations').update(stationId, { 
        isPlaying: true,
        volume: volume // Maintain current volume when switching stations
      });
      await fetchStations();
    } catch (error) {
      console.error('Error updating station:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteStation = async (stationId) => {
    try {
      setIsLoading(true);
      await pb.collection('stations').delete(stationId);
      await fetchStations();
    } catch (error) {
      console.error('Error deleting station:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateVolumeInPocketBase = useCallback(async (newVolume) => {
    try {
      const currentPlayingStation = stations.find(station => station.isPlaying);
      if (currentPlayingStation) {
        await pb.collection('stations').update(currentPlayingStation.id, {
          volume: newVolume
        });
      }
    } catch (error) {
      console.error('Error updating volume:', error);
    }
  }, [stations]);

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);

    // Clear previous timeout
    if (volumeTimeout) {
      clearTimeout(volumeTimeout);
    }

    // Set new timeout for updating PocketBase
    const timeout = setTimeout(() => {
      updateVolumeInPocketBase(newVolume);
    }, 100); // 100ms debounce

    setVolumeTimeout(timeout);
  };

  return (
    <div className="container py-4">
      <div className="card mb-4" style={{ backgroundColor: '#264653' }}>
        <div className="card-body text-center">
          <h1 className="mb-0 text-white">Radio 102ka MHz | Dashboard</h1>
        </div>
      </div>
      <div className="row g-4">
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title mb-4">Add New Station</h5>
              <form onSubmit={handleAddStation}>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">Name</label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    value={newStation.name}
                    onChange={(e) => setNewStation({ ...newStation, name: e.target.value })}
                    placeholder="Enter station name"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="url" className="form-label">Stream URL</label>
                  <input
                    type="url"
                    className="form-control"
                    id="url"
                    value={newStation.streamUrl}
                    onChange={(e) => setNewStation({ ...newStation, streamUrl: e.target.value })}
                    placeholder="Enter stream URL"
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary w-100" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Adding...
                    </>
                  ) : (
                    'Add Station'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-md-8">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title mb-4">Radio Stations</h5>
              <div className="volume-control mb-4">
                <label htmlFor="volume" className="form-label d-flex align-items-center">
                  <FontAwesomeIcon icon={faVolumeUp} className="me-2" />
                  Volume
                </label>
                <input
                  type="range"
                  className="form-range"
                  id="volume"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                />
                <div className="d-flex justify-content-between">
                  <small className="text-muted">0%</small>
                  <small className="text-muted">{Math.round(volume * 100)}%</small>
                </div>
              </div>
              {isLoading ? (
                <div className="text-center">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <div className="list-group">
                  {stations.map((station) => (
                    <div
                      key={station.id}
                      className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${
                        station.isPlaying ? 'active' : ''
                      }`}
                    >
                      <div>
                        <h6 className="mb-1">{station.name}</h6>
                        <small>{station.streamUrl}</small>
                      </div>
                      <div className="d-flex gap-2">
                        <button
                          className={`btn btn-sm ${station.isPlaying ? 'btn-light' : 'btn-primary'}`}
                          onClick={() => handlePlayStation(station.id)}
                          title={station.isPlaying ? 'Stop' : 'Play'}
                        >
                          {station.isPlaying ? (
                            <FontAwesomeIcon icon={faStop} />
                          ) : (
                            <FontAwesomeIcon icon={faPlay} />
                          )}
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDeleteStation(station.id)}
                          title="Delete"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Controller; 