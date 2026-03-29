import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import type { RoundResponse, RoundWithResults } from '../types/api';
import gussReady from '../assets/guss_ready.png';
import gussStop from '../assets/guss_stop.png';
import gussTapped from '../assets/guss_tapped.png';
import './RoundPage.css';

function isResults(r: RoundResponse): r is RoundWithResults {
  return 'totalScore' in r && r.totalScore !== undefined;
}

const RoundPage: React.FC = () => {
  const { uuid } = useParams<{ uuid: string }>();
  const navigate = useNavigate();
  const [roundData, setRoundData] = useState<RoundResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isTapping, setIsTapping] = useState(false);
  const [tapCount, setTapCount] = useState(0);

  const fetchRoundData = useCallback(async (opts?: { silent?: boolean }) => {
    if (!uuid) {
      return;
    }

    try {
      if (!opts?.silent) {
        setLoading(true);
      }
      const data = await apiService.getRound(uuid);
      setRoundData(data);
      const initial =
        typeof data.currentUserScore === 'number' ? data.currentUserScore : 0;
      setTapCount(initial);
      setError(null);
    } catch (err) {
      setError('Ошибка загрузки данных раунда');
      console.error('Error fetching round data:', err);
    } finally {
      if (!opts?.silent) {
        setLoading(false);
      }
    }
  }, [uuid]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    void fetchRoundData();
  }, [fetchRoundData]);

  useEffect(() => {
    if (!roundData) {
      return;
    }
    const end = new Date(roundData.round.end_datetime);
    if (currentTime <= end) {
      return;
    }
    if (isResults(roundData)) {
      return;
    }
    void fetchRoundData({ silent: true });
  }, [currentTime, roundData, fetchRoundData]);

  const handleTap = async () => {
    if (!roundData || isTapping || !uuid) {
      return;
    }

    try {
      setIsTapping(true);
      const response = await apiService.tap(uuid);
      setTapCount(response.score);
    } catch (err) {
      console.error('Error performing tap:', err);
    } finally {
      setTimeout(() => setIsTapping(false), 100);
    }
  };

  const handleMouseDown = () => {
    if (!roundData || isTapping) {
      return;
    }
    setIsTapping(true);
  };

  const handleMouseUp = () => {
    setIsTapping(false);
  };

  const handleMouseLeave = () => {
    setIsTapping(false);
  };

  if (loading && !roundData) {
    return (
      <div className="round-page">
        <div className="loading">Загрузка...</div>
      </div>
    );
  }

  if (error || !roundData) {
    return (
      <div className="round-page">
        <div className="error">{error || 'Раунд не найден'}</div>
        <button type="button" onClick={() => navigate('/')} className="back-button">
          Вернуться к списку раундов
        </button>
      </div>
    );
  }

  const { round } = roundData;
  const startTime = new Date(round.start_datetime);
  const endTime = new Date(round.end_datetime);

  const isBeforeStart = currentTime < startTime;
  const isActive = currentTime >= startTime && currentTime < endTime;
  const isFinished = currentTime >= endTime;

  const getTimeUntilStart = () => {
    const diff = startTime.getTime() - currentTime.getTime();
    if (diff <= 0) {
      return '00:00';
    }
    const minutes = Math.floor(diff / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getTimeUntilEnd = () => {
    const diff = endTime.getTime() - currentTime.getTime();
    if (diff <= 0) {
      return '00:00';
    }
    const minutes = Math.floor(diff / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getCurrentImage = () => {
    if (isTapping) {
      return gussTapped;
    }
    if (isActive) {
      return gussReady;
    }
    return gussStop;
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const player = apiService.getUser()?.username ?? '';

  return (
    <div className="round-page">
      <div className="round-header">
        <button type="button" onClick={() => navigate('/')} className="back-button">
          ← Раунды
        </button>
        <h1>
          {isBeforeStart && 'Cooldown '}
          {isActive && 'Раунд активен '}
          {isFinished && 'Раунд завершён '}
          {player}
        </h1>
      </div>

      <div className="round-info">
        <div className="round-details">
          <div className="detail-item">
            <span className="label">ID:</span>
            <span className="value">{round.uuid}</span>
          </div>
          <div className="detail-item">
            <span className="label">Начало:</span>
            <span className="value">{formatDateTime(startTime)}</span>
          </div>
          <div className="detail-item">
            <span className="label">Окончание:</span>
            <span className="value">{formatDateTime(endTime)}</span>
          </div>
        </div>

        {isBeforeStart && (
          <div className="countdown">
            <h2>Cooldown</h2>
            <div className="countdown-timer">до начала раунда {getTimeUntilStart()}</div>
          </div>
        )}

        {isActive && (
          <div className="active-round">
            <h2>Раунд активен!</h2>
            <div className="time-remaining">До конца осталось: {getTimeUntilEnd()}</div>
            <div className="score-section">
              <h3>Мои очки — {tapCount}</h3>
            </div>
          </div>
        )}

        {isFinished && isResults(roundData) && (
          <div className="round-results">
            <div className="results-grid">
              <div className="result-item">
                <span className="result-label">Всего</span>
                <span className="result-value">{roundData.totalScore}</span>
              </div>
              {roundData.bestPlayer && (
                <div className="result-item">
                  <span className="result-label">Победитель</span>
                  <span className="result-value">
                    {roundData.bestPlayer.username} — {roundData.bestPlayer.score}
                  </span>
                </div>
              )}
              <div className="result-item">
                <span className="result-label">Мои очки</span>
                <span className="result-value">{roundData.currentUserScore}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="guss-container">
        <img
          src={getCurrentImage()}
          alt="Guss"
          className={`guss-image ${isActive ? 'clickable' : ''} ${isTapping ? 'tapping' : ''}`}
          onClick={isActive ? handleTap : undefined}
          onMouseDown={isActive ? handleMouseDown : undefined}
          onMouseUp={isActive ? handleMouseUp : undefined}
          onMouseLeave={isActive ? handleMouseLeave : undefined}
          draggable={false}
        />
        {isActive && (
          <div className="tap-instruction">Тапайте по гусю с мутацией G-42</div>
        )}
      </div>
    </div>
  );
};

export default RoundPage;
