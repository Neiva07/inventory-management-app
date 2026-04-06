'use client';

import { useEffect, useState } from 'react';
import { Monitor, Apple, Terminal, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type OperatingSystem = 'windows' | 'macos' | 'linux' | 'unknown';

interface GitHubRelease {
  tag_name: string;
  assets: {
    name: string;
    browser_download_url: string;
  }[];
}

export default function DownloadPage() {
  const [os, setOs] = useState<OperatingSystem>('unknown');
  const [downloadUrl, setDownloadUrl] = useState<string>('');
  const [release, setRelease] = useState<GitHubRelease | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelease = async () => {
      try {
        const response = await fetch('https://api.github.com/repos/Neiva07/inventory-management-app/releases');
        const releases: GitHubRelease[] = await response.json();
        const withAssets = releases.find(r => r.assets && r.assets.length > 0);
        if (withAssets) {
          setRelease(withAssets);
        }
      } catch (error) {
        console.error('Error fetching release:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRelease();
  }, []);

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (!release || !release.assets) return;

    const getAssetUrl = (pattern: string) => {
      const asset = release.assets.find(a => a.name.includes(pattern));
      return asset?.browser_download_url || '';
    };

    if (userAgent.includes('win')) {
      setOs('windows');
      setDownloadUrl(getAssetUrl('.exe'));
    } else if (userAgent.includes('mac')) {
      setOs('macos');
      setDownloadUrl(getAssetUrl('darwin-arm64'));
    } else if (userAgent.includes('linux')) {
      setOs('linux');
      setDownloadUrl(getAssetUrl('.deb'));
    }
  }, [release]);

  const osConfig = {
    windows: { icon: Monitor, label: 'Windows', color: 'text-blue-500', pattern: '.exe' },
    macos: { icon: Apple, label: 'macOS', color: 'text-foreground', pattern: 'darwin-arm64' },
    linux: { icon: Terminal, label: 'Linux', color: 'text-orange-500', pattern: '.deb' },
    unknown: { icon: Download, label: 'seu sistema', color: 'text-muted-foreground', pattern: '' },
  } as const;

  const currentOs = osConfig[os];
  const OsIcon = currentOs.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-background to-indigo-50">
      <main className="p-4 md:p-10 mx-auto max-w-7xl">
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
          <div className="mb-8 space-y-4">
            <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Baixe o Inventarum
            </h1>
            <p className="text-2xl text-muted-foreground max-w-2xl mx-auto">
              Gerencie seu inventário com facilidade e eficiência
            </p>
          </div>

          <Card className="max-w-2xl w-full bg-background/80 backdrop-blur-md shadow-2xl border-0 rounded-3xl mb-8">
            <CardContent className="p-10 flex flex-col items-center space-y-6">
              <OsIcon className={`w-16 h-16 ${currentOs.color}`} />
              <div className="space-y-2">
                <p className="text-2xl font-semibold">
                  Parece que você está usando {currentOs.label}
                </p>
                <p className="text-muted-foreground">
                  {loading ? 'Carregando...' : 'Clique no botão abaixo para baixar a versão compatível com seu sistema'}
                </p>
              </div>
              <Button
                size="lg"
                className="w-full py-6 text-xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 rounded-xl"
                onClick={() => window.location.href = downloadUrl}
                disabled={loading || !downloadUrl}
              >
                {loading ? 'CARREGANDO...' : `BAIXAR PARA ${currentOs.label.toUpperCase()}`}
              </Button>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
            {(['windows', 'macos', 'linux'] as const).map((platform) => {
              const config = osConfig[platform];
              const Icon = config.icon;
              const assetUrl = release?.assets.find(a => a.name.includes(config.pattern))?.browser_download_url || '#';

              return (
                <Card key={platform} className="bg-background/80 backdrop-blur-md shadow-xl border-0 rounded-2xl">
                  <CardContent className="p-6 flex flex-col items-center">
                    <Icon className={`w-12 h-12 ${config.color} mb-4`} />
                    <h3 className="text-xl font-semibold mb-2">{config.label}</h3>
                    <p className="text-muted-foreground mb-4">
                      {loading ? 'Carregando...' : `Versão ${release?.tag_name || '1.0.0'}`}
                    </p>
                    <Button
                      className="w-full"
                      onClick={() => window.location.href = assetUrl}
                      disabled={loading}
                    >
                      Baixar
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
