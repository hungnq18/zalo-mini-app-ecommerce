import { Star, Trophy } from 'lucide-react';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Page, useSnackbar } from 'zmp-ui';
import BackButton from '../components/BackButton';
import { useApp } from '../context/AppContext';
import '../css/luckyWheelPage.scss';
import ApiService from '../services/apiService';

const LuckyWheelPage = ({ shouldLoad = true }) => {
  const navigate = useNavigate();
  const { state, actions } = useApp();
  const snackbar = useSnackbar();
  // Toggle this flag to bypass client-side blocking (for API/voucher testing).
  // WARNING: keep false for production. Set true only for manual testing.
  const TEST_MODE_API_ONLY = true;
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentPrize, setCurrentPrize] = useState(null);
  // Removed spinsLeft state - now using user.remainingSpins from database
  const [showResult, setShowResult] = useState(false);
  const [prizes, setPrizes] = useState([]);
  const [wheelConfig, setWheelConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Build conic-gradient background for curved, equal arcs
  const wheelBackground = useMemo(() => {
    if (!prizes || prizes.length === 0) return undefined;
    const numSegments = prizes.length;
    const anglePerSegment = 360 / numSegments;
    const segments = prizes.map((p, index) => {
      const start = (index * anglePerSegment).toFixed(3);
      const end = ((index + 1) * anglePerSegment).toFixed(3);
      const color = p.color || '#ccc';
      return `${color} ${start}deg ${end}deg`;
    });
    return `conic-gradient(${segments.join(',')})`;
  }, [prizes]);

  // Helpers to draw true circular sectors with SVG
  const toRadians = (deg) => (deg * Math.PI) / 180;
  const polarToCartesian = (cx, cy, r, angleDeg) => {
    const rad = toRadians(angleDeg);
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad)
    };
  };

  const describeSectorPath = (cx, cy, r, startAngle, endAngle) => {
    // Ensure angles increasing counter-clockwise from +X axis
    const start = polarToCartesian(cx, cy, r, startAngle);
    const end = polarToCartesian(cx, cy, r, endAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
    // Move to center, line to start, arc to end, close
    return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 1 ${end.x} ${end.y} Z`;
  };

  // Function to display full text for wheel (no abbreviation)
  const getDisplayText = (text) => String(text || '');

  const loadWheelData = useCallback(async () => {
    if (dataLoaded) return; // Prevent multiple API calls
    
    try {
      setLoading(true);
      console.log('Loading wheel data from API...');
      
      // Load wheel configuration and prizes from API
      const response = await ApiService.getWheelData();
      console.log('Wheel API response:', response);
      
      if (response.success) {
        const data = response.data;
        console.log('Wheel data:', data);
        
        // Check if data is wrapped twice
        if (data.success && data.data) {
          console.log('Data is wrapped twice, using inner data');
          const innerData = data.data;
          setPrizes(innerData.prizes || []);
          setWheelConfig(innerData.config || {});
          console.log('Wheel config set:', innerData.config);
        } else {
          // Normal structure
          setPrizes(data.prizes || []);
          setWheelConfig(data.config || {});
          console.log('Wheel config set:', data.config);
        }
        setDataLoaded(true); // Mark as loaded
      } else {
        console.error('API failed - no fallback data');
        setPrizes([]);
        setWheelConfig({ enabled: false });
      }
    } catch (error) {
      console.error('Error loading wheel data:', error);
      setPrizes([]);
      setWheelConfig({ enabled: false });
    } finally {
      setLoading(false);
    }
  }, [dataLoaded]); // Add dataLoaded as dependency

  // Load wheel data from API and initialize user spins
  useEffect(() => {
    if (!shouldLoad) return;
    
    loadWheelData();
  }, [shouldLoad, loadWheelData]); // Simplified dependencies

  // Separate useEffect for user initialization to avoid infinite loops
  useEffect(() => {
    if (!shouldLoad) return;
    
    // Initialize/reset user spins using resetTime and lastSpinAt (timestamp)
    const currentUser = state.user || {};
    if (currentUser.id) {
      const now = new Date();
      const resetTimeStr = wheelConfig?.resetTime || '00:00';

      const [rh, rm] = String(resetTimeStr).split(':').map(s => Number(s || 0));
      // Build today's reset datetime
      const todayReset = new Date(now.getFullYear(), now.getMonth(), now.getDate(), rh || 0, rm || 0, 0);
      // Determine the last reset boundary: if current time is before today's reset, the boundary is yesterday's reset
      const lastResetBoundary = now >= todayReset ? todayReset : new Date(todayReset.getTime() - 24 * 3600 * 1000);

      const lastSpinAt = currentUser.lastSpinAt ? new Date(currentUser.lastSpinAt) : (currentUser.lastSpinDate ? new Date(`${currentUser.lastSpinDate}T00:00:00Z`) : null);

      // If user has not spun since last reset boundary, reset remainingSpins
      if (!lastSpinAt || lastSpinAt < lastResetBoundary) {
        const resetSpins = (wheelConfig && wheelConfig.dailySpins) ? wheelConfig.dailySpins : (currentUser.dailySpins || 3);
        actions.updateUser({
          remainingSpins: resetSpins,
          dailySpins: resetSpins,
          // keep lastSpinAt empty until first spin today
          lastSpinDate: lastSpinAt ? currentUser.lastSpinDate : undefined
        }).catch(error => {
          console.error('Error resetting user spins for new day (resetTime):', error);
        });
      } else if (currentUser.remainingSpins === undefined) {
        // If remainingSpins missing but user has spun today, initialize to dailySpins
        const initSpins = (currentUser.dailySpins !== undefined) ? currentUser.dailySpins : (wheelConfig?.dailySpins || 3);
        actions.updateUser({ remainingSpins: initSpins }).catch(error => {
          console.error('Error initializing user remaining spins:', error);
        });
      }
    }
  }, [shouldLoad, state.user?.id, wheelConfig]); // Re-run when wheelConfig changes so resets use correct config

  const handleSpin = async () => {
    const currentUser = state.user || {};
    // Ensure user's remainingSpins is up-to-date with resetTime and enforce spinCooldown
    const now = new Date();
    const resetTimeStr = wheelConfig?.resetTime || '00:00';
    const [rh, rm] = String(resetTimeStr).split(':').map(s => Number(s || 0));
    const todayReset = new Date(now.getFullYear(), now.getMonth(), now.getDate(), rh || 0, rm || 0, 0);
    const lastResetBoundary = now >= todayReset ? todayReset : new Date(todayReset.getTime() - 24 * 3600 * 1000);

    const lastSpinAt = currentUser.lastSpinAt ? new Date(currentUser.lastSpinAt) : (currentUser.lastSpinDate ? new Date(`${currentUser.lastSpinDate}T00:00:00Z`) : null);

    if (!lastSpinAt || lastSpinAt < lastResetBoundary) {
      // Reset lượt quay cho khoảng mới (theo resetTime)
      const resetSpins = (wheelConfig && wheelConfig.dailySpins) ? wheelConfig.dailySpins : (currentUser.dailySpins || 3);
      await actions.updateUser({
        remainingSpins: resetSpins,
        dailySpins: resetSpins
      });
    }

    // Enforce spinCooldown (assume minutes)
    const spinCooldownMinutes = Number(wheelConfig?.spinCooldown || 0);
    if (spinCooldownMinutes > 0 && currentUser.lastSpinAt) {
      const last = new Date(currentUser.lastSpinAt);
      const diffMs = now.getTime() - last.getTime();
      const cooldownMs = spinCooldownMinutes * 60 * 1000;
      if (diffMs < cooldownMs) {
        const waitSec = Math.ceil((cooldownMs - diffMs) / 1000);
        const mins = Math.floor(waitSec / 60);
        const secs = waitSec % 60;
        snackbar.openSnackbar({
          text: `Vui lòng chờ ${mins}m ${secs}s trước khi quay tiếp.`,
          type: 'warning',
          duration: 3000
        });
        return;
      }
    }

    const remainingSpins = (state.user && state.user.remainingSpins) ? Number(state.user.remainingSpins) : 0;

    if (isSpinning || remainingSpins <= 0) {
      if (remainingSpins <= 0) {
        snackbar.openSnackbar({
          text: 'Bạn đã hết lượt quay hôm nay! Hãy quay lại vào ngày mai.',
          type: 'warning',
          duration: 3000
        });
      }
      return;
    }

    setIsSpinning(true);
    setShowResult(false);
    // Request server to perform a spin (server will validate cooldown/reset and update user)
    let serverRes = null;
    try {
      serverRes = await ApiService.spinWheel({
        userId: state.user?.id,
        // sending prizeId null — server will log the actual prize if provided
        timestamp: new Date().toISOString()
      });
      console.log('Server spin response:', serverRes);
      if (!serverRes.success) {
        // If server returned message, show it clearly
        const msg = serverRes.message || serverRes.error || 'Spin failed on server';
        snackbar.openSnackbar({ text: msg, type: 'warning', duration: 4000 });
        throw new Error(msg);
      }

      // Refresh user from server so client state matches authoritative server state
      await actions.loadUser();
    } catch (err) {
      console.error('Server spin error:', err);
      setIsSpinning(false);
      snackbar.openSnackbar({ text: 'Không thể quay lúc này. Vui lòng thử lại sau.', type: 'error', duration: 3000 });
      return;
    }

    // Weighted random prize based on probability
    const getRandomPrize = (prizes) => {
      const random = Math.random();
      let cumulativeProbability = 0;

      for (const prize of prizes) {
        cumulativeProbability += prize.probability || 0;
        if (random <= cumulativeProbability) {
          return prize;
        }
      }

      // Fallback to last prize if something goes wrong
      return prizes[prizes.length - 1];
    };

    const selectedPrize = getRandomPrize(prizes);

    setTimeout(async () => {
      setCurrentPrize(selectedPrize);
      setIsSpinning(false);
      setShowResult(true);

      // Cộng điểm cho tất cả giải thưởng
      await handlePrizeWin(selectedPrize);

      // Update user's lastSpinAt timestamp (record the time of this spin)
      try {
        await actions.updateUser({ lastSpinAt: new Date().toISOString() });
      } catch (e) {
        console.error('Error updating lastSpinAt:', e);
      }
    }, 3000);
  };

  const handlePrizeWin = async (prize) => {
    try {
      const currentUser = state.user || {};
      
      // Tính điểm dựa trên loại giải thưởng
      let pointsToAdd = 0;
      if (prize.type === 'voucher') {
        pointsToAdd = prize.value === '50k' ? 10 : prize.value === '100k' ? 20 : prize.value === 'VIP' ? 50 : 0;
      } else if (prize.type === 'discount') {
        pointsToAdd = 5; // Điểm cho giảm giá
      } else if (prize.type === 'free_shipping') {
        pointsToAdd = 3; // Điểm cho miễn ship
      } else if (prize.type === 'good_luck') {
        pointsToAdd = 1; // Điểm cho chúc may mắn
      }
      
      // Cộng điểm cho user
      if (pointsToAdd > 0) {
        const currentPoints = Number(currentUser.points || 0);
        const newPoints = currentPoints + pointsToAdd;
        
        await actions.updateUser({
          points: newPoints
        });
      }
      
      // Xử lý voucher nếu trúng voucher
      if (prize.type === 'voucher') {
        await handleVoucherWin(prize);
      }
      
      // Log spin result to API
      await ApiService.logSpinResult({
        userId: currentUser.id,
        prizeId: prize.id,
        prizeType: prize.type,
        voucherId: prize.voucherId || null,
        pointsEarned: pointsToAdd,
        timestamp: new Date().toISOString()
      });
      
      // Hiển thị thông báo thành công
      if (prize.type === 'voucher') {
        snackbar.openSnackbar({
          text: `🎉 Chúc mừng! Bạn đã nhận được ${prize.name}! +${pointsToAdd} điểm`,
          type: 'success',
          duration: 3000
        });
      } else {
        snackbar.openSnackbar({
          text: `🎉 Chúc mừng! Bạn đã nhận được ${prize.name}! +${pointsToAdd} điểm`,
          type: 'success',
          duration: 3000
        });
      }
    } catch (error) {
      console.error('Error handling prize win:', error);
      snackbar.openSnackbar({
        text: 'Có lỗi xảy ra khi xử lý giải thưởng',
        type: 'error',
        duration: 2000
      });
    }
  };

  const handleVoucherWin = async (prize) => {
    try {
      const currentUser = state.user || {};
      
      // Kiểm tra xem user đã có voucher này chưa
      const userVoucherIds = Array.isArray(currentUser.vouchers) ? currentUser.vouchers : [];
      const existingVoucher = userVoucherIds.includes(prize.voucherId);
      
      if (!existingVoucher) {
        // Thêm voucher ID vào danh sách voucher của user
        const updatedVouchers = [...userVoucherIds, prize.voucherId];
        
        // Cập nhật user với voucher ID mới
        await actions.updateUser({
          vouchers: updatedVouchers
        });
        
        // Hiển thị thông báo thành công
        snackbar.openSnackbar({
          text: `🎉 Chúc mừng! Bạn đã nhận được ${prize.name}!`,
          type: 'success',
          duration: 3000
        });
      } else {
        snackbar.openSnackbar({
          text: `Bạn đã có voucher này rồi!`,
          type: 'info',
          duration: 2000
        });
      }
    } catch (error) {
      console.error('Error adding voucher:', error);
      snackbar.openSnackbar({
        text: 'Có lỗi xảy ra khi thêm voucher',
        type: 'error',
        duration: 2000
      });
    }
  };

  const handleCloseResult = () => {
    setShowResult(false);
    setCurrentPrize(null);
  };

  if (loading) {
    return (
      <Page className="lucky-wheel-page">
        <div className="lucky-wheel-container">
          <div className="lucky-wheel-header">
            <BackButton 
              text=""
              variant="ghost"
              size="small"
              className="back-button"
            />
            <h1>Vòng quay may mắn</h1>
          </div>
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Đang tải dữ liệu vòng quay...</p>
          </div>
        </div>
      </Page>
    );
  }

  if (!wheelConfig?.enabled) {
    console.log('Wheel disabled, config:', wheelConfig);
    return (
      <Page className="lucky-wheel-page">
        <div className="lucky-wheel-container">
          <div className="lucky-wheel-header">
            <BackButton 
              text=""
              variant="ghost"
              size="small"
              className="back-button"
            />
            <h1>Vòng quay may mắn</h1>
          </div>
          <div className="disabled-container">
            <div className="disabled-icon">🚫</div>
            <h3>Vòng quay tạm thời ngừng hoạt động</h3>
            <p>Vui lòng quay lại sau!</p>
          </div>
        </div>
      </Page>
    );
  }

  return (
    <Page className="lucky-wheel-page">
      <div className="lucky-wheel-container">
        <div className="lucky-wheel-header">
          <BackButton 
            text=""
            variant="ghost"
            size="small"
            className="back-button"
          />
          <h1>Vòng quay may mắn</h1>
        </div>

        <div className="lucky-wheel-content">
          {/* Thông tin lượt quay */}
          <div className="spin-info">
            <div className="spins-left">
              <Trophy size={20} />
              <span>Lượt quay còn lại: {state.user?.remainingSpins || 0}</span>
            </div>
            <div className="daily-reset">
              <Star size={16} />
              <span>Làm mới hàng ngày</span>
            </div>
          </div>

          {/* Vòng quay */}
          <div className="wheel-container">
            <div className={`wheel ${isSpinning ? 'spinning' : ''}`}>
              {/* True circular sectors via SVG */}
              <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: '100%' }}>
                {prizes.map((prize, index) => {
                  const num = prizes.length || 8;
                  const angle = 360 / num;
                  const start = index * angle;       // 0°,45°,… from +X axis
                  const end = (index + 1) * angle;
                  const d = describeSectorPath(50, 50, 50, start, end);
                  const mid = start + angle / 2;
                  const labelRadius = 30; // radius for label baseline
                  const labelPoint = polarToCartesian(50, 50, labelRadius, mid);
                  // Maximum length text can take along the arc (minus small padding)
                  const arcLength = (Math.PI * angle / 180) * labelRadius;
                  const textLen = Math.max(arcLength - 2, 12);
                  return (
                    <g key={prize.id}>
                      <path d={d} fill={prize.color} stroke="none" />
                      {/* Centered label for the sector */}
                      <text
                        x={labelPoint.x}
                        y={labelPoint.y}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        transform={`rotate(${mid}, ${labelPoint.x}, ${labelPoint.y})`}
                        className="svg-prize-text"
                        lengthAdjust="spacingAndGlyphs"
                        textLength={textLen}
                      >
                        {getDisplayText(prize.name)}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
            <div className="wheel-pointer"></div>
          </div>

          {/* Nút quay */}
          <div className="spin-button-container">
            <button 
              className={`spin-button ${isSpinning || (!TEST_MODE_API_ONLY && (state.user?.remainingSpins || 0) <= 0) ? 'disabled' : ''}`}
              onClick={handleSpin}
              disabled={isSpinning || (!TEST_MODE_API_ONLY && (state.user?.remainingSpins || 0) <= 0)}
            >
              {isSpinning ? 'Đang quay...' : (!TEST_MODE_API_ONLY && (state.user?.remainingSpins || 0) <= 0) ? 'Hết lượt' : 'QUAY NGAY'}
            </button>
          </div>

          {/* Danh sách giải thưởng */}
          <div className="prizes-list">
            <h3>Danh sách giải thưởng</h3>
            <div className="prizes-grid">
              {prizes.map(prize => (
                <div key={prize.id} className="prize-item">
                  <div className="prize-icon">{prize.icon}</div>
                  <div className="prize-info">
                    <div className="prize-name">{prize.name}</div>
                    <div className="prize-value">{prize.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal kết quả */}
        {showResult && currentPrize && (
          <div className="result-modal">
            <div className="result-content">
              <div className="result-header">
                <button className="close-button" onClick={handleCloseResult} aria-label="Đóng">
                  <span>×</span>
                </button>
                <div className="result-icon">{currentPrize.icon}</div>
                <h2>
                  {currentPrize.type === 'voucher' ? '🎉 Chúc mừng!' : 
                   currentPrize.type === 'none' ? '😔 Chúc may mắn lần sau!' : 
                   '🎁 Bạn đã trúng!'}
                </h2>
              </div>
              <div className="result-prize">
                <div className="prize-name">{currentPrize.name}</div>
                <div className="prize-value">{currentPrize.value}</div>
                {currentPrize.type === 'voucher' && (
                  <div className="voucher-info">
                    <div className="voucher-badge">VOUCHER ĐẶC BIỆT</div>
                    <div className="voucher-description">
                      Chỉ có thể nhận được từ vòng quay may mắn
                    </div>
                    <div className="voucher-expiry">
                      Có hiệu lực trong 30 ngày
                    </div>
                  </div>
                )}
              </div>
              <div className="result-actions">
                <button className="btn-primary" onClick={handleCloseResult}>
                  {currentPrize.type === 'voucher' ? 'Xem voucher của tôi' : 'Đóng'}
                </button>
                {currentPrize.type === 'voucher' && (
                  <button className="btn-secondary" onClick={() => navigate('/my-vouchers')}>
                    Đi đến kho voucher
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Page>
  );
};

export default memo(LuckyWheelPage);
