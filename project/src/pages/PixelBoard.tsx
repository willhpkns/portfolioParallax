import { useState, useEffect } from 'react';
import { pixelApi, type Pixel } from '../services/pixelApi';
import toast from 'react-hot-toast';
import { HexColorPicker } from 'react-colorful';

export default function PixelBoard() {
  const [boardState, setBoardState] = useState<Pixel[]>([]);
  const [selectedColor, setSelectedColor] = useState("#000000");
  const [settings, setSettings] = useState({
    boardSize: 100,
    rateLimit: 60,
  });
  const [nextAllowedTime, setNextAllowedTime] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBoardData();
  }, []);

  const loadBoardData = async (retryCount = 3) => {
    try {
      const [settingsData, boardData] = await Promise.all([
        pixelApi.getPublicSettings(),
        pixelApi.getBoard()
      ]);

      // Get full settings to check maintenance mode
      const fullSettings = await pixelApi.getSettings().catch(() => ({
        enabled: true,
        maintenanceMessage: ''
      }));

      if (!fullSettings.enabled) {
        toast.error(fullSettings.maintenanceMessage || 'Pixel Board is currently in maintenance mode.');
      }
      setSettings(settingsData);
      setBoardState(boardData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading board data:', error);
      if (retryCount > 0) {
        // Wait for 1 second before retrying
        setTimeout(() => {
          loadBoardData(retryCount - 1);
        }, 1000);
      } else {
        toast.error('Failed to load pixel board. Please refresh the page.');
        setLoading(false);
      }
    }
  };

  // Refresh board data periodically
  useEffect(() => {
    if (loading) return;

    const intervalId = setInterval(async () => {
      try {
        const boardData = await pixelApi.getBoard();
        setBoardState(boardData);
      } catch (error) {
        console.error('Error refreshing board:', error);
      }
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(intervalId);
  }, [loading]);

  const handlePixelClick = async (x: number, y: number) => {
    try {
      // Check if board is in maintenance mode
      const fullSettings = await pixelApi.getSettings().catch(() => ({
        enabled: true,
        maintenanceMessage: ''
      }));

      if (!fullSettings.enabled) {
        toast.error(fullSettings.maintenanceMessage || 'Pixel Board is currently in maintenance mode.');
        return;
      }

      if (nextAllowedTime && new Date() < nextAllowedTime) {
        const timeLeft = Math.ceil((nextAllowedTime.getTime() - Date.now()) / 1000);
        toast.error(`Please wait ${timeLeft} seconds before placing another pixel`);
        return;
      }

      // Try to update the pixel
      await pixelApi.updatePixel(x, y, selectedColor);
      toast.success('Pixel placed successfully');
      
      // Update next allowed time
      setNextAllowedTime(new Date(Date.now() + settings.rateLimit * 1000));
      
      // Refresh board
      try {
        const newBoardState = await pixelApi.getBoard();
        setBoardState(newBoardState);
      } catch (refreshError) {
        console.error('Error refreshing board:', refreshError);
        // Don't show error toast here since the pixel was placed successfully
      }
    } catch (error: any) {
      if (error?.response?.status === 429) {
        const timeLeft = error?.response?.data?.timeLeft || settings.rateLimit;
        toast.error(`Rate limit exceeded. Please wait ${timeLeft} seconds before placing another pixel.`);
        setNextAllowedTime(new Date(Date.now() + timeLeft * 1000));
      } else if (error?.response?.status === 503) {
        // Maintenance mode error
        const message = error?.response?.data?.message || 'Pixel Board is currently in maintenance mode.';
        toast.error(message);
      } else {
        toast.error('Failed to update pixel. Please try again.');
        console.error('Pixel update error:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F5EDE0] py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-[#2C1810] mb-8">Pixel Board</h1>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Color Picker */}
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4">Select Color</h2>
            <HexColorPicker color={selectedColor} onChange={setSelectedColor} />
            <div className="mt-4 text-center">
              <div 
                className="w-12 h-12 rounded border border-gray-300 mx-auto mb-2"
                style={{ backgroundColor: selectedColor }}
              />
              <input
                type="text"
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="w-24 px-2 py-1 border rounded text-center"
              />
            </div>
          </div>

          {/* Pixel Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <div 
                className="grid gap-0.5 bg-gray-100 p-2 rounded-lg"
                style={{
                  gridTemplateColumns: `repeat(${settings.boardSize}, minmax(4px, 1fr))`,
                }}
              >
                {Array.from({ length: settings.boardSize * settings.boardSize }, (_, i) => {
                  const x = Math.floor(i / settings.boardSize);
                  const y = i % settings.boardSize;
                  const pixel = boardState.find(p => p.x === x && p.y === y);
                  return (
                    <div
                      key={`${x}-${y}`}
                      className="aspect-square cursor-pointer hover:opacity-75 transition-opacity"
                      style={{ 
                        backgroundColor: pixel?.color || '#FFFFFF',
                      }}
                      onClick={() => handlePixelClick(x, y)}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Rate Limit Info */}
        {nextAllowedTime && new Date() < nextAllowedTime && (
          <div className="mt-4 text-center text-[#5C4B37]">
            Next pixel in: {Math.ceil((nextAllowedTime.getTime() - Date.now()) / 1000)}s
          </div>
        )}
      </div>
    </div>
  );
}
