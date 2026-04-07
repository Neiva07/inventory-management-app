'use client';

import { useEffect, useState } from 'react';
import { Download, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ShimmerButton } from '@/components/ui/shimmer-button';
import { Card, CardContent } from '@/components/ui/card';
import BlurFade from '@/components/magicui/blur-fade';
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text';
import { cn } from '@/lib/utils';

type OperatingSystem = 'windows' | 'macos' | 'linux' | 'unknown';

interface GitHubRelease {
  tag_name: string;
  assets: {
    name: string;
    browser_download_url: string;
    size: number;
  }[];
}

function OsIcon({ platform, className }: { platform: OperatingSystem; className?: string }) {
  if (platform === 'unknown') {
    return <Download className={className} />;
  }
  return (
    <Image
      src={`/icons/${platform === 'macos' ? 'apple' : platform}.svg`}
      alt={platform}
      width={64}
      height={64}
      className={className}
    />
  );
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '';
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(0)} MB`;
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
    windows: { label: 'Windows', pattern: '.exe', req: 'Windows 10+' },
    macos: { label: 'macOS', pattern: 'darwin-arm64', req: 'macOS 12+ (Apple Silicon)' },
    linux: { label: 'Linux', pattern: '.deb', req: 'Ubuntu 20.04+ / Debian' },
    unknown: { label: 'seu sistema', pattern: '', req: '' },
  } as const;

  const currentOs = osConfig[os];
  const currentAsset = release?.assets.find(a => a.name.includes(currentOs.pattern));

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-blue-50/30 to-background">
      <main className="px-4 md:px-10 mx-auto max-w-5xl pt-16 pb-24">

        {/* Hero */}
        <div className="flex flex-col items-center text-center mb-16">
          <BlurFade delay={0.1}>
            <AnimatedGradientText className="mb-6">
              <span className="text-sm font-medium">
                {loading ? 'Carregando...' : `Versão ${release?.tag_name || '1.0.0'} disponível`}
              </span>
              <ChevronRight className="ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
            </AnimatedGradientText>
          </BlurFade>

          <BlurFade delay={0.2}>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-4">
              Baixe o{' '}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Inventarum
              </span>
            </h1>
          </BlurFade>

          <BlurFade delay={0.3}>
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto">
              Controle de estoque completo direto no seu computador.
              Instale em segundos e comece a usar imediatamente.
            </p>
          </BlurFade>
        </div>

        {/* Main download card */}
        <BlurFade delay={0.4}>
          <Card className="max-w-2xl mx-auto bg-background/60 backdrop-blur-xl shadow-2xl shadow-blue-500/5 border border-border/50 rounded-3xl mb-16">
            <CardContent className="p-8 md:p-10">
              <div className="flex flex-col items-center space-y-6">
                <div className="p-4 rounded-2xl bg-muted/50">
                  <OsIcon platform={os} className="w-14 h-14" />
                </div>

                <div className="space-y-1 text-center">
                  <p className="text-xl font-semibold">
                    {os === 'unknown' ? 'Escolha seu sistema' : `Recomendado para ${currentOs.label}`}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {currentOs.req}
                    {currentAsset ? ` — ${formatFileSize(currentAsset.size)}` : ''}
                  </p>
                </div>

                <ShimmerButton
                  className="w-full max-w-md py-5 text-lg font-semibold"
                  background="linear-gradient(135deg, #2563eb, #4f46e5)"
                  borderRadius="14px"
                  onClick={() => window.location.href = downloadUrl}
                  disabled={loading || !downloadUrl}
                >
                  <Download className="w-5 h-5 mr-2" />
                  {loading ? 'Carregando...' : `Baixar para ${currentOs.label}`}
                </ShimmerButton>

                <p className="text-xs text-muted-foreground/60">
                  Gratuito — Sem cadastro necessário para instalar
                </p>
              </div>
            </CardContent>
          </Card>
        </BlurFade>

        {/* Other platforms */}
        <BlurFade delay={0.6}>
          <div className="text-center mb-6">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground/60">
              Disponível para
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {(['windows', 'macos', 'linux'] as const).map((platform) => {
              const config = osConfig[platform];
              const asset = release?.assets.find(a => a.name.includes(config.pattern));
              const assetUrl = asset?.browser_download_url || '#';
              const isDetected = platform === os;

              return (
                <Card
                  key={platform}
                  className={cn(
                    "bg-background/60 backdrop-blur-sm border rounded-2xl transition-all duration-200 hover:shadow-lg hover:border-blue-200",
                    isDetected && "border-blue-300 shadow-md shadow-blue-500/5"
                  )}
                >
                  <CardContent className="p-6 flex flex-col items-center text-center gap-3 h-full">
                    <div className="w-12 h-12 flex items-center justify-center">
                      <OsIcon platform={platform} className="w-10 h-10 max-h-10 object-contain" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{config.label}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {asset ? `${formatFileSize(asset.size)} — ${config.req}` : config.req}
                      </p>
                    </div>
                    {isDetected ? (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                        Seu sistema
                      </span>
                    ) : (
                      <div className="h-[18px]" />
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-auto"
                      onClick={() => window.location.href = assetUrl}
                      disabled={loading || !asset}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Baixar
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </BlurFade>

      </main>
    </div>
  );
}
