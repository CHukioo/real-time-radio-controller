import React, { useEffect, useState, useRef } from 'react';
import pb from '../pocketbase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPause, faVolumeUp, faVolumeMute } from '@fortawesome/free-solid-svg-icons';

function Player() {
    const [currentStation, setCurrentStation] = useState(null);
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(1);

    // Function to attempt playback
    const attemptPlayback = async () => {
        if (audioRef.current) {
            try {
                await audioRef.current.play();
                setIsPlaying(true);
            } catch (error) {
                console.log('Playback error:', error);
                setIsPlaying(false);
            }
        }
    };

    // Function to toggle play/pause
    const togglePlayPause = async () => {
        if (audioRef.current) {
            try {
                if (isPlaying) {
                    await audioRef.current.pause();
                    setIsPlaying(false);
                } else {
                    await audioRef.current.play();
                    setIsPlaying(true);
                }
            } catch (error) {
                console.error('Error toggling play/pause:', error);
                setIsPlaying(false);
            }
        }
    };

    // Function to toggle mute
    const toggleMute = () => {
        if (audioRef.current) {
            audioRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    // Function to handle volume change
    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (audioRef.current) {
            audioRef.current.volume = newVolume;
        }
    };

    // Effect for initial station load
    useEffect(() => {
        let unsubscribe = null;

        const setupSubscription = async () => {
            try {
                const records = await pb.collection('stations').getList(1, 1, {
                    filter: 'isPlaying = true',
                });
                if (records.items.length > 0) {
                    const station = records.items[0];
                    setCurrentStation(station);
                    if (station.volume !== undefined) {
                        setVolume(station.volume);
                        if (audioRef.current) {
                            audioRef.current.volume = station.volume;
                        }
                    }
                }

                unsubscribe = await pb.collection('stations').subscribe('*', function (e) {
                    if (e.action === 'update') {
                        setCurrentStation(e.record);
                        // If this is the new playing station, start playing
                        if (e.record.isPlaying) {
                            setTimeout(() => {
                                if (audioRef.current) {
                                    audioRef.current.load();
                                    attemptPlayback();
                                }
                            }, 100);
                        }
                    }
                });
            } catch (error) {
                console.error('Error in setup:', error);
            }
        };

        setupSubscription();

        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, []);

    // Effect for handling volume changes
    useEffect(() => {
        if (audioRef.current && currentStation?.volume !== undefined) {
            const newVolume = currentStation.volume;
            setVolume(newVolume);
            audioRef.current.volume = newVolume;
        }
    }, [currentStation?.volume]);

    // Effect for handling play/pause state
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);
        const handleEnded = () => {
            setIsPlaying(false);
        };

        audio.addEventListener('play', handlePlay);
        audio.addEventListener('pause', handlePause);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('play', handlePlay);
            audio.removeEventListener('pause', handlePause);
            audio.removeEventListener('ended', handleEnded);
        };
    }, []);

    // Effect to handle audio source changes
    useEffect(() => {
        if (currentStation && audioRef.current) {
            audioRef.current.load();
            if (currentStation.isPlaying) {
                attemptPlayback();
            }
        }
    }, [currentStation?.streamUrl]);

    return (
        <div className="player-container">
            <div className="card">
                <div className="card-body" style={{ padding: '60px 150px' }}>
                    <h1>Radio 102ka MHz</h1>
                    <h2 className="card-title mb-4 text-center">Radio Player</h2>
                    {currentStation ? (
                        <>
                            <div className="text-center mb-4">
                                <h3 className="mb-3">{currentStation.name}</h3>
                                <audio
                                    ref={audioRef}
                                    src={currentStation.streamUrl}
                                    preload="auto"
                                    muted={isMuted}
                                    style={{ display: 'none' }}
                                />
                            </div>

                            <div className="d-flex flex-column align-items-center">
                                <div className="d-flex align-items-center mb-3">
                                    <button
                                        className="btn btn-lg rounded-circle me-3"
                                        onClick={togglePlayPause}
                                        style={{ 
                                            width: '60px', 
                                            height: '60px',
                                            backgroundColor: '#264653',
                                            borderColor: '#264653',
                                            color: 'white'
                                        }}
                                    >
                                        <FontAwesomeIcon
                                            icon={isPlaying ? faPause : faPlay}
                                            size="lg"
                                        />
                                    </button>
                                    <button
                                        className="btn rounded-circle"
                                        onClick={toggleMute}
                                        style={{ 
                                            width: '40px', 
                                            height: '40px',
                                            borderColor: '#264653',
                                            color: '#264653'
                                        }}
                                    >
                                        <FontAwesomeIcon
                                            icon={isMuted ? faVolumeMute : faVolumeUp}
                                        />
                                    </button>
                                </div>

                                {/* <div className="volume-control w-100" style={{ maxWidth: '300px' }}>
                  <div className="d-flex align-items-center">
                    <input
                      type="range"
                      className="form-range flex-grow-1 me-2"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={handleVolumeChange}
                    />
                    <small className="text-muted" style={{ minWidth: '45px' }}>
                      {Math.round(volume * 100)}%
                    </small>
                  </div>
                </div> */}
                            </div>
                        </>
                    ) : (
                        <div className="py-5 text-center">
                            <p className="text-muted mb-0">No station is currently playing</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Player; 