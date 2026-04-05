'use client';

import { Card, Title, Text, Button } from '@tremor/react';
import { useEffect, useState } from 'react';
import { FaWindows, FaApple, FaLinux } from 'react-icons/fa';

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
    // Fetch latest release from GitHub
    const fetchRelease = async () => {
      try {
        const response = await fetch('https://api.github.com/repos/Neiva07/inventory-management-app/releases/latest');
        const data = await response.json();
        setRelease(data);
      } catch (error) {
        console.error('Error fetching release:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRelease();
  }, []);

  useEffect(() => {
    // Detect operating system and set appropriate download URL
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (!release || !release.assets) return;

    const getAssetUrl = (pattern: string) => {
      const asset = release.assets.find(asset => asset.name.includes(pattern));
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

  const getOSIcon = () => {
    switch (os) {
      case 'windows':
        return <FaWindows className="w-16 h-16 text-blue-500" />;
      case 'macos':
        return <FaApple className="w-16 h-16 text-gray-800" />;
      case 'linux':
        return <FaLinux className="w-16 h-16 text-orange-500" />;
      default:
        return null;
    }
  };

  const getOSName = () => {
    switch (os) {
      case 'windows':
        return 'Windows';
      case 'macos':
        return 'macOS';
      case 'linux':
        return 'Linux';
      default:
        return 'seu sistema';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <main className="p-4 md:p-10 mx-auto max-w-7xl">
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
          <div className="mb-8 space-y-4">
            <Title className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Baixe o Inventarum
            </Title>
            <Text className="text-2xl text-gray-600 max-w-2xl mx-auto">
              Gerencie seu inventário com facilidade e eficiência
            </Text>
          </div>

          <Card className="p-10 max-w-2xl w-full bg-white/80 backdrop-blur-md shadow-2xl hover:shadow-3xl transition-all duration-300 border-0 rounded-3xl mb-8">
            <div className="flex flex-col items-center space-y-6">
              {getOSIcon()}
              <div className="space-y-2">
                <Text className="text-2xl font-semibold text-gray-800">
                  Parece que você está usando {getOSName()}
                </Text>
                <Text className="text-gray-600">
                  {loading ? 'Carregando...' : 'Clique no botão abaixo para baixar a versão compatível com seu sistema'}
                </Text>
              </div>
              <Button 
                className="w-full py-6 text-xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-[1.02] rounded-xl"
                onClick={() => window.location.href = downloadUrl}
                disabled={loading || !downloadUrl}
              >
                {loading ? 'CARREGANDO...' : `BAIXAR PARA ${getOSName().toUpperCase()}`}
              </Button>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
            <Card className="p-6 bg-white/80 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-300 border-0 rounded-2xl">
              <FaWindows className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <Title className="text-xl font-semibold mb-2">Windows</Title>
              <Text className="text-gray-600 mb-4">
                {loading ? 'Carregando...' : `Versão ${release?.tag_name || '1.0.0'}`}
              </Text>
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={() => window.location.href = release?.assets.find(a => a.name.includes('.exe'))?.browser_download_url || '#'}
                disabled={loading}
              >
                Baixar
              </Button>
            </Card>

            <Card className="p-6 bg-white/80 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-300 border-0 rounded-2xl">
              <FaApple className="w-12 h-12 text-gray-800 mx-auto mb-4" />
              <Title className="text-xl font-semibold mb-2">macOS</Title>
              <Text className="text-gray-600 mb-4">
                {loading ? 'Carregando...' : `Versão ${release?.tag_name || '1.0.0'}`}
              </Text>
              <Button 
                className="w-full bg-gray-800 hover:bg-gray-900"
                onClick={() => window.location.href = release?.assets.find(a => a.name.includes('darwin-arm64'))?.browser_download_url || '#'}
                disabled={loading}
              >
                Baixar
              </Button>
            </Card>

            <Card className="p-6 bg-white/80 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-300 border-0 rounded-2xl">
              <FaLinux className="w-12 h-12 text-orange-500 mx-auto mb-4" />
              <Title className="text-xl font-semibold mb-2">Linux</Title>
              <Text className="text-gray-600 mb-4">
                {loading ? 'Carregando...' : `Versão ${release?.tag_name || '1.0.0'}`}
              </Text>
              <Button 
                className="w-full bg-orange-500 hover:bg-orange-600"
                onClick={() => window.location.href = release?.assets.find(a => a.name.includes('.deb'))?.browser_download_url || '#'}
                disabled={loading}
              >
                Baixar
              </Button>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
