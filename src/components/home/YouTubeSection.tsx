import React, { useEffect, useState } from 'react';
import { Play, Youtube } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface YouTubeVideo {
    id: string;
    title: string;
}

const YouTubeSection: React.FC = () => {
    const [videos, setVideos] = useState<YouTubeVideo[]>([]);
    const [mainVideo, setMainVideo] = useState<string | null>(null);

    useEffect(() => {
        // Fetch settings to get YouTube config
        const fetchSettings = async () => {
            try {
                const res = await fetch('/api/settings');
                if (res.ok) {
                    const data = await res.json();
                    if (data.youtubeVideos && data.youtubeVideos.length > 0) {
                        setVideos(data.youtubeVideos);
                        setMainVideo(data.youtubeVideos[0].id);
                    } else if (data.latestVideoId) {
                        setMainVideo(data.latestVideoId);
                    }
                }
            } catch (error) {
                console.error("Failed to load YouTube settings");
            }
        };
        fetchSettings();
    }, []);

    if (!mainVideo) return null;

    return (
        <section className="py-20 bg-stone-50 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />

            <div className="container-app relative z-10">
                <div className="flex flex-col md:flex-row items-center justify-between mb-10">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Youtube className="h-5 w-5 text-red-600" />
                            <span className="text-sm font-bold tracking-wider text-red-600 uppercase">Our Channel</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-display font-bold text-stone-900">
                            Watch & Drapery
                        </h2>
                    </div>
                    <Button variant="outline" className="mt-4 md:mt-0 gap-2 border-red-200 text-red-700 hover:bg-red-50" asChild>
                        <a href="https://www.youtube.com/@ShreerangSarees" target="_blank" rel="noreferrer">
                            Subscribe Channel <Play className="h-3 w-3 fill-current" />
                        </a>
                    </Button>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Player */}
                    <div className="lg:col-span-2 aspect-video rounded-2xl overflow-hidden shadow-2xl ring-1 ring-black/10">
                        <iframe
                            width="100%"
                            height="100%"
                            src={`https://www.youtube.com/embed/${mainVideo}?rel=0&modestbranding=1`}
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>

                    {/* Playlist / Side List */}
                    <div className="flex flex-col gap-4">
                        <h3 className="font-bold text-lg text-stone-800">Recent Uploads</h3>
                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {videos.map((video) => (
                                <div
                                    key={video.id}
                                    onClick={() => setMainVideo(video.id)}
                                    className={`flex gap-3 p-3 rounded-xl cursor-pointer transition-all ${mainVideo === video.id ? 'bg-white shadow-md ring-1 ring-black/5' : 'hover:bg-white/50'}`}
                                >
                                    <div className="relative w-24 aspect-video rounded-lg overflow-hidden bg-stone-200 flex-shrink-0">
                                        <img
                                            src={`https://img.youtube.com/vi/${video.id}/mqdefault.jpg`}
                                            alt={video.title}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                            <div className="w-6 h-6 rounded-full bg-white/90 flex items-center justify-center">
                                                <Play className="h-3 w-3 fill-stone-900 text-stone-900 ml-0.5" />
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <p className={`text-sm font-semibold line-clamp-2 ${mainVideo === video.id ? 'text-red-700' : 'text-stone-700'}`}>
                                            {video.title}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default YouTubeSection;
