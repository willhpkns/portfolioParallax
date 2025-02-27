import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { pixelApi, type PixelBoardSettings, type PixelStats, type Pixel, type TimelapseData } from '../../services/pixelApi';
import toast from 'react-hot-toast';
import { Play, Pause, FastForward, Rewind, Settings, Maximize2, Minimize2 } from 'lucide-react';

interface ColorStat {
  _id: string;
  count: number;
}

interface HourStat {
  _id: {
    year: number;
    month: number;
    day: number;
    hour: number;
  };
  count: number;
}

const PixelModal = ({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: React.ReactNode }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full h-full max-w-[95vw] max-h-[95vh] flex flex-col">
        <div className="flex justify-end p-2">
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <Minimize2 size={24} />
          </button>
        </div>
        <div className="flex-1 overflow-hidden p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

const GridCoordinates = () => (
  <>
    <div className="absolute left-12 right-4 top-0 flex justify-between px-2">
      {[0, 25, 50, 75, 99].map(x => (
        <span key={x} className="text-xs text-gray-500">{x}</span>
      ))}
    </div>
    <div className="absolute top-12 bottom-4 left-0 flex flex-col justify-between py-2">
      {[0, 25, 50, 75, 99].map(y => (
        <span key={y} className="text-xs text-gray-500 w-8 text-right">{y}</span>
      ))}
    </div>
  </>
);

export default function PixelBoardManager(): JSX.Element {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentSettings, setCurrentSettings] = useState<PixelBoardSettings>({
    rateLimit: 60,
    boardSize: 100,
    enabled: true,
    maintenanceMessage: "Pixel Board is currently in maintenance mode. Please try again later."
  });
  const [draftSettings, setDraftSettings] = useState<PixelBoardSettings>({
    rateLimit: 60,
    boardSize: 100,
    enabled: true,
    maintenanceMessage: "Pixel Board is currently in maintenance mode. Please try again later."
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [timelapseData, setTimelapseData] = useState<TimelapseData | null>(null);
  const [currentStateIndex, setCurrentStateIndex] = useState(0);
  const [boardState, setBoardState] = useState<Pixel[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(2);
  const [stats, setStats] = useState<PixelStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!isPlaying || !timelapseData) return;

    const interval = setInterval(() => {
      setCurrentStateIndex(current => {
        const next = current + 1;
        if (next >= timelapseData.states.length) {
          setIsPlaying(false);
          return current;
        }
        setBoardState(timelapseData.states[next].fullState);
        return next;
      });
    }, 100 / playbackSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, timelapseData, playbackSpeed]);

  const loadData = async () => {
    try {
      const [settingsData, statsData, timelapseData] = await Promise.all([
        pixelApi.getSettings(),
        pixelApi.getStats(),
        pixelApi.getTimelapse()
      ]);
      setCurrentSettings(settingsData);
      setDraftSettings(settingsData);
      setStats(statsData);
      setTimelapseData(timelapseData);
      if (timelapseData.states.length > 0) {
        setBoardState(timelapseData.states[0].fullState);
      }
    } catch (error) {
      toast.error('Failed to load pixel board data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      const updatedSettings = await pixelApi.updateSettings(draftSettings);
      setCurrentSettings(updatedSettings);
      setIsSettingsOpen(false);
      toast.success('Settings updated successfully');
    } catch (error) {
      toast.error('Failed to update settings');
    }
  };

  const handlePlayPause = () => {
    if (!timelapseData) return;
    
    if (!isPlaying && currentStateIndex >= timelapseData.states.length - 1) {
      setCurrentStateIndex(0);
      setBoardState(timelapseData.states[0].fullState);
    }
    setIsPlaying(!isPlaying);
  };

  const handleSliderChange = (value: number) => {
    if (!timelapseData) return;
    setCurrentStateIndex(value);
    setBoardState(timelapseData.states[value].fullState);
  };

  const handleSpeedChange = (multiplier: number) => {
    setPlaybackSpeed(multiplier);
  };

  const renderStats = (): JSX.Element | null => {
    if (!stats) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Total Pixels</h3>
          <p className="text-2xl font-bold">{stats.totalPixels}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Most Used Colors</h3>
          <div className="flex flex-wrap gap-2">
            {(stats.colorStats as ColorStat[]).slice(0, 5).map(({ _id, count }) => (
              <div key={_id} className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: _id }}
                />
                <span>{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Peak Activity</h3>
          <div>
            {(stats.mostActiveHours as HourStat[])[0] && (
              <p>
                {new Date(
                  stats.mostActiveHours[0]._id.year,
                  stats.mostActiveHours[0]._id.month - 1,
                  stats.mostActiveHours[0]._id.day,
                  stats.mostActiveHours[0]._id.hour
                ).toLocaleString()}: {stats.mostActiveHours[0].count} pixels
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderGrid = (currentPixel: Pixel, grid: (Pixel | null)[][]): JSX.Element => (
    <div className="relative w-full overflow-auto rounded-lg">
      <GridCoordinates />
      <div 
        className="relative w-full bg-gray-50 border border-gray-200 rounded-lg p-4 ml-8 mt-8"
        style={{
          maxWidth: isFullscreen ? '90vh' : '70vh',
          maxHeight: isFullscreen ? '90vh' : '70vh',
          margin: '0 auto',
          aspectRatio: '1/1'
        }}
      >
        <div
          className="grid bg-white p-2 rounded-lg h-full"
          style={{
            gridTemplateColumns: `repeat(${currentSettings.boardSize}, 1fr)`,
            gridTemplateRows: `repeat(${currentSettings.boardSize}, 1fr)`,
            gap: '1px',
            backgroundColor: '#E5E7EB'
          }}
        >
          {Array(currentSettings.boardSize).fill(null).map((_, x) =>
            Array(currentSettings.boardSize).fill(null).map((_, y) => {
              const pixel = grid[y][x]; // Swapped x and y here
              return (
                <div
                  key={`${x}-${y}`}
                  className={`group relative transition-all w-full h-full min-w-[4px] min-h-[4px] ${
                    x === currentPixel.x && y === currentPixel.y
                      ? 'ring-2 ring-[#2C1810] ring-offset-[0.5px] z-20 scale-110'
                      : ''
                  } ${
                    x % 10 === 0 && y % 10 === 0 ? 'border-r border-b border-gray-300' :
                    x % 10 === 0 ? 'border-r border-gray-200' :
                    y % 10 === 0 ? 'border-b border-gray-200' : 
                    'hover:ring-1 hover:ring-gray-300'
                  }`}
                  style={{
                    backgroundColor: pixel ? pixel.color : '#FFFFFF'
                  }}
                  title={`${x}, ${y}${pixel ? ` - ${pixel.color}` : ''}`}
                >
                  <div className="hidden group-hover:block absolute -top-6 left-1/2 -translate-x-1/2 bg-black/75 text-white text-xs px-2 py-1 rounded z-30">
                    {x}, {y}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );

  const renderPixelBoard = () => {
    if (!timelapseData) return <div>No data available</div>;

    const currentPixel = timelapseData.states[currentStateIndex]?.pixel;
    if (!currentPixel) return <div>No pixel data available</div>;

    const grid = Array(currentSettings.boardSize)
      .fill(null)
      .map(() => Array(currentSettings.boardSize).fill(null));

    boardState.forEach(pixel => {
      if (pixel.x < currentSettings.boardSize && pixel.y < currentSettings.boardSize) {
        grid[pixel.y][pixel.x] = pixel;
      }
    });

    const pixelInfo = (
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-gray-500 block mb-1">Position</span>
            <div className="flex items-center bg-gray-50 px-3 py-2 rounded">
              <span className="font-medium">{currentPixel.x}, {currentPixel.y}</span>
            </div>
          </div>
          <div>
            <span className="text-sm text-gray-500 block mb-1">Progress</span>
            <div className="flex items-center bg-gray-50 px-3 py-2 rounded">
              <span className="font-medium">
                {Math.round((currentStateIndex / (timelapseData.states.length - 1)) * 100)}%
              </span>
            </div>
          </div>
          <div className="col-span-2">
            <span className="text-sm text-gray-500 block mb-1">Color</span>
            <div className="flex items-center gap-3 bg-gray-50 px-3 py-2 rounded">
              <div 
                className="w-8 h-8 rounded-md border border-gray-200"
                style={{ backgroundColor: currentPixel.color }}
              />
              <code className="text-sm">{currentPixel.color}</code>
            </div>
          </div>
        </div>
      </div>
    );

    const gridContent = (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg text-[#2C1810]">Pixel Board Replay</h3>
            <span className="text-sm text-gray-500">
              {new Date(timelapseData.states[currentStateIndex].timestamp).toLocaleTimeString()}
            </span>
          </div>
          <button
            onClick={() => setIsFullscreen(true)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <Maximize2 size={20} />
          </button>
        </div>
        {renderGrid(currentPixel, grid)}
        <div className="mt-4">
          {pixelInfo}
        </div>
      </div>
    );

    return (
      <>
        <div className="bg-white p-4 rounded-lg shadow-md w-full">
          {gridContent}
        </div>
        <PixelModal isOpen={isFullscreen} onClose={() => setIsFullscreen(false)}>
          {gridContent}
        </PixelModal>
      </>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-[#2C1810]">Pixel Board Manager</h1>
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-[#2C1810] text-white rounded-lg hover:bg-[#5C4B37]"
          >
            <Settings size={20} />
            Settings
          </button>
        </div>

        {isSettingsOpen && (
          <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
            <h2 className="text-xl font-semibold mb-4">Board Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Rate Limit (seconds)</label>
                <input
                  type="number"
                  value={draftSettings.rateLimit}
                  onChange={(e) => setDraftSettings(prev => ({ ...prev, rateLimit: parseInt(e.target.value) }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#5C4B37] focus:ring-[#5C4B37]"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Maintenance Mode</label>
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    checked={!draftSettings.enabled}
                    onChange={(e) => setDraftSettings(prev => ({ ...prev, enabled: !e.target.checked }))}
                    className="h-4 w-4 text-[#2C1810] focus:ring-[#5C4B37] border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">Enable Maintenance Mode</label>
                </div>
                <textarea
                  value={draftSettings.maintenanceMessage}
                  onChange={(e) => setDraftSettings(prev => ({ ...prev, maintenanceMessage: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#5C4B37] focus:ring-[#5C4B37]"
                  rows={3}
                  placeholder="Enter maintenance mode message..."
                />
              </div>
              <button
                onClick={handleSaveSettings}
                className="w-full px-4 py-2 bg-[#2C1810] text-white rounded-lg hover:bg-[#5C4B37]"
              >
                Save Settings
              </button>
            </div>
          </div>
        )}

        {renderStats()}

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="space-y-6">
            {timelapseData && (
              <div className="flex items-center gap-4 mb-4">
                <input
                  type="range"
                  min={0}
                  max={timelapseData.states.length - 1}
                  value={currentStateIndex}
                  onChange={(e) => handleSliderChange(parseInt(e.target.value))}
                  className="w-full"
                />
                <span className="text-sm text-gray-600 whitespace-nowrap min-w-[100px]">
                  {currentStateIndex + 1} / {timelapseData.states.length}
                </span>
              </div>
            )}

            <div className="flex justify-center gap-4 items-center">
              <button
                onClick={handlePlayPause}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                {isPlaying ? <Pause size={24} /> : <Play size={24} />}
              </button>
              <button
                onClick={() => handleSpeedChange(Math.max(0.5, playbackSpeed / 2))}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <Rewind size={24} />
              </button>
              <button
                onClick={() => handleSpeedChange(Math.min(8, playbackSpeed * 2))}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <FastForward size={24} />
              </button>
              <span className="flex items-center">
                {playbackSpeed}x Speed
              </span>
            </div>
          </div>
          
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            renderPixelBoard()
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
