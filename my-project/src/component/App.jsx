
import { useEffect, useState } from "react";
import "./App.css";
import App from "./App.jsx";

function App() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Use your YouTube Data API key
  const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

  const API_URL = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&regionCode=IN&maxResults=12&key=${API_KEY}`;

  useEffect(() => {
    const controller = new AbortController();

    async function getVideos() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(API_URL, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(
            `API Error: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();

        console.log("YouTube API Data:", data);

        // YouTube API returns videos inside data.items
        const formattedVideos = (data.items || []).map((video) => ({
          id: video.id,
          title: video.snippet.title,
          thumbnail:
            video.snippet.thumbnails?.medium?.url ||
            video.snippet.thumbnails?.default?.url,
          channel: video.snippet.channelTitle,
          views: Number(video.statistics?.viewCount || 0),
        }));

        setVideos(formattedVideos);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("API Error:", error);
          setError(error.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    getVideos();

    return () => {
      controller.abort();
    };
  }, [API_URL]);

  return (
    <div>
      <nav className="navbar">
        <h1 className="logo">MyTube</h1>

        <input
          type="text"
          placeholder="Search videos..."
          className="search"
        />
      </nav>

      <div className="container">
        <aside className="sidebar">
          <p>🏠 Home</p>
          <p>🔥 Trending</p>
          <p>📺 Subscriptions</p>
          <p>📚 Library</p>
        </aside>

        <main className="videos">
          {loading && <p>Loading videos...</p>}

          {error && <p className="error">{error}</p>}

          {!loading && !error && videos.length === 0 && (
            <p>No videos found.</p>
          )}

          {!loading &&
            !error &&
            videos.map((video) => (
              <div className="video-card" key={video.id}>
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="thumbnail"
                />

                <h3>{video.title}</h3>

                <p className="channel">{video.channel}</p>

                <p className="views">
                  {video.views.toLocaleString()} views
                </p>
              </div>
            ))}
        </main>
      </div>
    </div>
  );
}

export default App;
